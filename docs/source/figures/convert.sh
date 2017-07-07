for f in `ls *.eps`; do
     convert -density 100 $f -flatten ${f%.*}.png;
done
