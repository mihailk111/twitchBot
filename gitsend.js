const  {
    exec,
    execSync
}= require('child_process');


// exec('git add *', () => {

//     exec('git commit -m "just a commit" ', () => {

//         exec('git push', () => {

//         });
//     });
// });

execSync ('git add *');
execSync('git commit -m "just a commit" ');
execSync('git push');
