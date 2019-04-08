#!/usr/bin/env ruby
require 'csv'
require 'json'

# This script will be called for each .json after running the following on the server:
# rake project:build_and_export_final_data

# It will get the path to the .json as an argument.

# allow for some margin if markings slightly overlap, are outside bounds
# e.g. mark just slightly before letter start
$margin = 20
if ARGV.count != 1
  puts("Specify the json file to parse")
  exit()
end

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

def letter_in_range(page_letters, letters, y, page)  
  if page_letters.count == 1
    return letter = page_letters.last
  elsif page_letters.count > 1
    candidate = nil
    for letter in page_letters
      if (letter[:start_page] < page || 
        (letter[:start_page] == page && letter[:start_y] <= y)) &&
        (letter[:end_page] == page && letter[:end_y] && letter[:end_y] >= y ||
          !letter[:end_page] || letter[:end_page] > page)
        candidate = letter
      end
    end
    if candidate
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
filename = ARGV[0]
File.open filename do |file|
  data = JSON.load(file)
  subjects = data['subjects']
  letters = []
  for subject in subjects do
    last_letter = letters.last
    page_letters = if last_letter && !last_letter[:end_y] then [last_letter] else [] end
    page_number = subject['location']['standard'].gsub(/(^.*\/0*|\.jpg$)/, '').to_i

    # identify start endings of letters
    for separator in subject['assertions']
      .select {|assert| ['letter_start', 'letter_end'].include?assert['task_key'] }
      .map {|assert| { :task_key => assert['task_key'], :y => assert['data']['y'].to_f }}
      .sort {|a,b| a[:y] <=> b[:y] } do
      new_letter = nil
      if separator[:task_key] == 'letter_end'
        y = separator[:y]
        if page_letters.last && !page_letters.last[:end_y]
          page_letters.last[:end_y] = y + $margin
          page_letters.last[:end_page] = page_number
        else
          new_letter = {:start_y => y - $margin}
        end
      elsif separator[:task_key] == 'letter_start'
        y = separator[:y]
        if page_letters.last && !page_letters.last[:end_y]
          page_letters.last[:end_y] = y + $margin
          page_letters.last[:end_page] = page_number
        end
        # always start a new letter
        new_letter = {:start_y => y - $margin}
      end
      if new_letter
        new_letter[:start_page] = page_number
        new_letter[:empty] = true
        page_letters << new_letter
        letters << new_letter
      end
    end

    # get all the data for the letters
    for assert in subject['assertions'] do
      if !['letter_start', 'letter_end'].include?(assert['task_key']) &&
        assert['task_key'].start_with?('sk')
        letter = letter_in_range(page_letters, letters, assert['region']['y'].to_f, page_number)
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
      end
      letter[:subject_id] << subject['id']
      letter[:image_url] << subject['location']['standard']
    end
  end
  headers = [:start_page,
    :end_page,
    :start_y,
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
  CSV.open filename.gsub(/.json$/i, ".#{data['meta_data']['set_key']}.csv"), 'wb' do |csv|    
    csv << headers
    for letter in letters do
      if !letter[:empty]
        csv << headers.map{ |column| 
          case column
          when 'date (text)'
            if letter['date'] then letter['date']['text'] else '' end
          when 'date (standardized)'
            greg = letter['date']['gregorianDate'] if letter['date']
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
          else
            letter[column] || ''
          end }
      end
    end
  end
end
