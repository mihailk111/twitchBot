const  {
    exec,
    execSync
}= require('child_process');


execSync('git add *');
execSync('git commit -m "just a commit" ');
execSync('git push');
