#!/bin/bash
# Splits PDFs into directories for each document, containing the jpg
# pictures for each page. Also outputs a single csv-file containing
# all those pages as URL and with information about the language.
# Requires: pdftk, inkscape and Imagemagick
# give the path to the folder containing the PDFs as argument

mkdir -p ~/skillnet-output
echo "file_path,thumbnail,set_key,langs" >> ~/skillnet-output/group.csv
knownLanguages=("FR" "GER" "GR" "IT" "LAT" "SPAN")
IFS=$'\n';for file in $(ls "$1"); do
  if [[ $file != Verwijder* && $file != *"Geen brieven"* ]]; then
    if [[ -f "$1/$file" ]]; then
      parts=$(echo $file | tr "-" "\n")
      setKey=''
      # file should start with a language name e.g.
      # LAT-A. Lollinus-Epistulae-1642.pdf
      langMode=1
      langs=''
      for part in $parts; do
        if [ $langMode == 1 ]; then
          # is this part a language part?
          langPart=0
          for lang in "${knownLanguages[@]}"; do
            if [ "$part" == "$lang" ]; then
              langs="$langs;$part"
              langPart=1
            fi
          done
          if [ $langPart == 0 ]; then
            # rest of the parts is the cleaned filename
            langMode=0
          fi
        fi

        if [ $langMode == 0 ]; then
          setKey="$setKey-$part"
        fi
      done
      langs=${langs#;}

      # remove redundant dash and file extension
      setKey=${setKey#-}
      setKey=${setKey%.pdf}

      # remove weird characters
      setKey=${setKey//[ \[\],\.\(\)_]/-}
      setKey=$(echo $setKey | tr -s '-')
      setKey=${setKey#-}
      setKey=${setKey%-}
      
      mkdir -p ~/skillnet-output/$setKey

      # work-around for pdftk not liking unicode and not working from /tmp/
      ln -s $1/$file ~/skillnet-output/$setKey/input.pdf
      cd ~/skillnet-output/$setKey

      # converting them in one go results in a huge collection of enormous PDFs
      # convert one by one
      pageCount=$(pdftk input.pdf dump_data|grep NumberOfPages| awk '{print $2}')
      for i in `seq -w 1 $pageCount`;      
      do
        if [ ! -f $i.jpg ]; then
          eval "pdftk input.pdf cat $i output $i.pdf"
          inkscape "$i.pdf" -z --export-dpi=300 --export-area-drawing --export-png="$i.png"
          convert "$i.png" -quality 95 -resize 3000x3000 "$i.jpg"
          echo "https://skillnet.hum.uu.nl/data/$setKey/$i.jpg,https://skillnet.hum.uu.nl/data/$setKey/$i-thumb.jpg,$setKey,$langs" >> ~/skillnet-output/group.csv
        fi
        if [ ! -f $i-thumb.jpg ]; then
          pageImage="$i.png"
          if [ ! -f $i.png ]; then
            pageImage="$i.jpg"
          fi
          convert $pageImage -quality 95 -resize 500x500 "$i-thumb.jpg"
        fi
        rm -f "$i.pdf" "$i.png"
      done
      rm input.pdf
    fi
  fi
done
