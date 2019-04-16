#!/usr/bin/env ruby
require 'csv'
require 'json'

# This script will be called for each .json after running the following on the server:
# rake project:build_and_export_final_data

# It will get the path to the .json as an argument.

# allow for some margin if markings slightly overlap, are outside bounds
# e.g. mark just slightly before letter start
$margin = 20
$unknownDates = []

if ARGV.count != 1
  puts("Specify the json file to parse")
  exit()
end
filename = ARGV[0]

def get_assert_value(assert)
  if !assert['task_key'].start_with? "sk_"
    # only show transcribed values
    return nil
  end
  case assert['task_key']
  when 'sk_incipit',
    'sk_recipient_place',
    'sk_sender_place'
    assert['data']['value']
  when 'sk_sender_name',
    'sk_recipient_name'
    # two cells are returned: the text and the EMLO id (if specified)
    assert['data']['value']
  when 'sk_date'
    # two cells are returned: the text and the standardized value
    assert['data']['value']
  else
    assert['data']
  end
end

def get_cell_value(column, letter)
  case column
  when 'date (text)'
    if letter['date'] then letter['date']['text'] else '' end
  when 'date (standardized)'
    greg = letter['date']['gregorianDate'] if letter['date']
    if !greg && letter['date'] && letter['date']['text']
      converted = `cd #{__dir__} && node convert_date.js "#{letter['date']['text'].gsub(/"/, '').strip}"`.strip
      if !converted.empty?
        return converted
      end
      $unknownDates << "#{letter['date']['text']}"
    end
    if greg then "#{greg['year']}-#{greg['month']}-#{greg['day']}" else '' end
  when "sender_name",
    "recipient_name"
    if letter[column] then letter[column]['text'] || '' else '' end
  when "sender_name (id)",
    "recipient_name (id)"
    column_name = column.gsub(/ \(id\)$/, '')
    if letter[column_name] then letter[column_name]['id'] || '' else '' end
  when 'image_url'
    letter[:image_url] * " "
  when :start_y
    if letter[column] then "#{(100 * letter[column] / letter[:height][0]).round(1)}%" else '' end
  when :end_y
    if letter[column] then "#{(100 * letter[column] / letter[:height].last).round(1)}%" else '' end
  else
    letter[column] || ''
  end 
end

def letter_in_range(page_letters, letters, y, page, page_separators)
  if page_letters.count == 1
    return letter = page_letters.last
  elsif page_letters.count > 1
    candidate = nil
    for letter in page_letters
      if (letter[:start_page] < page || 
        (letter[:start_page] == page && letter[:start_y] <= y))
        candidate = letter
      end
    end
    if candidate
      # A letter is ended with the first letter start/end after
      # the latest marked field. If none is found, use the location of
      # that field instead.
      candidate[:end_page] = page
      candidate[:end_y] = page_separators.map { | s | s[:y] }.select { | sy | sy > y }.first || (y + $margin)
      return candidate
    end
  end

  # create a new letter  
  new_letter = {
    :empty => true,
    :start_page => page,
    :start_y => y - $margin
  }
  letters << new_letter
  page_letters << new_letter
  return new_letter
end

File.open filename do |file|
  data = JSON.load(file)
  subjects = data['subjects']
  letters = []
  separators = []

  # each page is a subject
  for subject in subjects do
    last_letter = letters.last
    page_letters = if last_letter then [last_letter] else [] end
    page_separators = []
    page_number = subject['location']['standard'].gsub(/(^.*\/0*|\.jpg$)/, '').to_i
    height = subject['height']

    # identify start endings of letters
    for separator in subject['assertions']
      .select {|assert| ['letter_start', 'letter_end'].include?assert['task_key'] }
      .map {|assert| { :task_key => assert['task_key'], :y => assert['data']['y'].to_f }}
      .sort {|a,b| a[:y] <=> b[:y] }
      .map {|separator| {:type => separator[:task_key], :y => separator[:y] }} do
      separator[:page_number] = page_number
      page_separators << separator
      separators << separator
    end

    # The start of a letter is the first letter start/end marked before
    # an incipit: letter starts and ends are annotated messily, but
    # incipits seem to be marked nicely so use that as an anchor point.    
    for assert in subject['assertions'] do
      if assert['task_key'] == 'sk_incipit'
        separator = (page_separators.select { |s| s[:y] < assert['region']['y'] }
          .last) ||
          separators.last ||
          { :y => assert['data']['y'] }

        if !last_letter || last_letter['incipit']
          # if a letter has been opened, but without incipit, use that
          # one instead!
          new_letter = {
            :start_page => separator[:page_number],
            :start_y => separator[:y],
            :empty => false
          }

          page_letters << new_letter
          letters << new_letter
        end
      end
    end

    # get all the data for the letters
    for assert in subject['assertions'] do
      if !['letter_start', 'letter_end'].include?(assert['task_key']) &&
        assert['task_key'].start_with?('sk')
        letter = letter_in_range(page_letters, letters, assert['region']['y'].to_f, page_number, page_separators)
        value = get_assert_value(assert)
        if value != nil
          letter[:empty] = false
          letter[assert['task_key'].gsub(/^sk_/, '')] = value
        end
      end
    end

    # mark all the page letters of this subject
    for letter in page_letters do
      if !letter[:subject_id]
        letter[:subject_id] = []
        letter[:image_url] = []
        letter[:height] = []
      end
      letter[:subject_id] << subject['id']
      letter[:image_url] << subject['location']['standard']
      letter[:height] << subject['height']
    end
  end
  headers = [:start_page,
    :start_y,
    :end_page,
    :end_y,
    "date (text)",
    "date (standardized)", 
    "sender_name",
    "sender_name (id)",
    "sender_place",
    "recipient_name",
    "recipient_name (id)",
    "recipient_place",
    "incipit",
    "image_url"]
  require 'write_xlsx'
  workbook = WriteXLSX.new(filename.gsub(/\.json$/i, ".#{data['meta_data']['set_key']}.xlsx"))
  worksheet = workbook.add_worksheet

  CSV.open filename.gsub(/\.json$/i, ".#{data['meta_data']['set_key']}.csv"), 'wb' do |csv|    
    csv << headers
    worksheet.write_row(0, 0, headers)
    i = 1
    for letter in letters do
      if !letter[:empty]
        data = headers.map { |column| [column, get_cell_value(column, letter)] }.to_h
        csv << headers.map { |column| data[column] }
        worksheet.write_row(
          i,
          0,
          # only one url per cell is supported by this library
          headers.map { |column| column == 'image_url' ? data[column].split(' ')[0] : data[column] })
        i = i + 1
      end
    end
  end
  workbook.close

  File.open filename.gsub(/[^\/\\]+$/i, "unknown_dates.txt"), 'a' do |f|
    f << "#{$unknownDates.uniq * "\n"}\n"
  end
end
