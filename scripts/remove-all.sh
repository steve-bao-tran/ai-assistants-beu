echo "Install package for each project"

# handle for lib common

# define root directory at here
rootDiretory=`pwd`;

# handle for each project
install(){
  echo "==============project $1================="
  cd $rootDiretory/$1
  serverless remove
}

install cii-global &
install cii-profile &
install cii-role &
install cii-user &
install cii-department &
install cii-masterdata &
install cii-messages &
install cii-plans &
install cii-project &
