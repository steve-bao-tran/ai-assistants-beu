echo "Deploy for each project"

# handle for lib common

# define root directory at here
rootDiretory=`pwd`;
defaultEnv='dev';
ENV=${1:-$defaultEnv}

cd $rootDiretory/cii-common
rm -rf lib && tsc && rm -rf node_modules

git checkout $ENV
git pull
# handle for each project
install(){
  echo "==============project $1================="
  echo "Environment: $ENV"
  cd $rootDiretory/$1
  NODE_ENV=$ENV npm run deploy
}

# install cii-global
install cii-profile
install cii-role
# install cii-user
# install cii-department
# install cii-masterdata
install cii-messages
install cii-plans
install cii-project
install cii-cron
install cii-feedback
install cii-helps