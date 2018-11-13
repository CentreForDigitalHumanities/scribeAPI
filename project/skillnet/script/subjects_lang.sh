#!/bin/bash
# Groups all the subjects by language
# Use ./subjects_lang.sh ../subjects/group_A.csv ../subjects/group_B.csv -o ../subjects
inputFiles=( )
outputDir=
while (( $# )); do
  if [[ $1 = -o ]]; then
    outputDir=$2; shift
  elif [[ $1 = -i ]]; then
    inputFiles+=( "$2" ); shift
  else
    inputFiles+=( "$1" )
  fi
  shift
done

for inputFile in "${inputFiles[@]}"; do
  for line in $(cat $inputFile); do
    langs="$(cut -d',' -f4 <<< $line)"
    if ! [ $langs = langs ]; then
      id=$(echo $langs | tr ";" "-")
      outputFile="$outputDir/group_$id.csv"    
      if [ ! -f $outputFile ]; then
        echo "file_path,thumbnail,set_key,langs" >> $outputFile
      fi
      echo $line >> $outputFile
    fi
  done
done
