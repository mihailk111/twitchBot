const {
    exec
} = require('child_process');


exec('git add *', () => {

    exec('git commit -m "just a commit" ', () => {

        exec('git push', () => {

        });
    });
});

