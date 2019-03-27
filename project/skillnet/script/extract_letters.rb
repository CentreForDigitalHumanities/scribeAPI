#!/usr/bin/env ruby
require 'json'

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
  when 'sk_date',
    'sk_sender_name',
    'sk_recipient_name'
    assert['data']['value']['text']
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

File.open ARGV[0] do |file|
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
      end
      letter[:subject_id] << subject['id']
    end
  end
  puts(letters.select {|letter| !letter[:empty]})
end
