const {
    exec
} = require('child_process');


exec('git add *', (err, stdout, stderr) => {

    exec('git commit -m "just a commit" ', (err, stdout, stderr) => {

        exec('git push', (err, stdout, stderr) => {

        });
    });
});

