const fs = require("fs");
const inquirer = require("inquirer");
const axios = require("axios");
const util = require("util");
let pdf = require('html-pdf');
const writeFileAsync = util.promisify(fs.writeFile);

promptUser();
function promptUser() {
    inquirer.prompt([   
    {
      type: "input",
      name: "username",
      message: "Enter your GitHub Username:"
    },
    {
      type: "input",
      name: "color",
      message: "Enter your favorite color:"
    }
  ])
  .then(function(answers) {
    const queryURL = `https://api.github.com/users/${answers.username}`;

    axios
    .get(queryURL)
    .then(function(result) {
        const info = {
            "name" : result.data.name,
            "pageURL" : result.data.html_url,
            "location" : result.data.location,
            "followers" : result.data.followers,
            "blog" : result.data.blog,
            "following" : result.data.following,
            "repocount" : result.data.public_repos,
            "imgURL" : result.data.avatar_url,
            "bio" : result.data.bio,
        }

        var html = generateHTML(info, answers);
        writeFileAsync("index.html", html);
       
        var options = { format: 'Letter' };
        pdf.create(html, options).toFile('./githubProfile.pdf', function(err, res) {
          if (err) return console.log(err);
          console.log(res);
        });
    });
  });
};

function generateHTML(info, answers) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
    <title>Document</title>
  </head>
  <body>
  <div class="jumbotron jumbotron-fluid" style="background-color:${answers.color}; border: 5px ${answers.color}; height: 100%;">
  <div class="container">
    <img class="rounded mx-auto d-block border border-light bg-light" src="${info.imgURL}">
    <h1 class="display-4 rounded p-5 mt-5 mr-2 ml-2 text-center bg-light">${info.name}</h1>
    <p class="lead bg-light rounded p-5 m-2">${info.bio}</p>
    <ul class="list-group m-2">
      <li class="list-group-item">Location: <a href="https://www.google.com/maps/place/${info.location}">${info.location}</a></li>
      <li class="list-group-item"><a href="${info.pageURL}">Github Link</a></li>
      <li class="list-group-item">Repositories: ${info.repocount}</li>
      <li class="list-group-item">Following: ${info.following}</li>
      <li class="list-group-item">Followers: ${info.followers}</li>
      <li class="list-group-item">Blog: <a href="${info.blog}">${info.blog}</a></li>
    </ul>
  </div>
</div>
</body>
</html>`;
}
