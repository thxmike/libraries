echo $1
npm version $2 && git add . && git commit -m"$1" && npm publish && git push