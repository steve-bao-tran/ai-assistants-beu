echo "Install package for each project"

# handle for lib common

# define root directory at here
rootDiretory=`pwd`;

cd $rootDiretory/sfr-common
rm -rf lib && tsc

# handle for each project
install(){
  echo "==============project $1================="
  cd $rootDiretory/$1
  rm -rf node_modules && yarn install
}

if [ ! -z $1 ]
then
  install $1
else
  install sfr-user
fi
