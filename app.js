const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs"); //Use EJS as view engine

let workItems=[];
let items=[];

app.get("/", function (req, res) {
  let day = date.getDate(); //Node Module 
  res.render("list", { listTitle: day, newListItems:items});
});

app.post("/", function(req, res){
  if(req.body.list==="Work"){
    workItems.push(req.body.newItem);
    res.redirect("/work");
  }
  else{
    items.push(req.body.newItem);
    res.redirect("/");
  }
});

app.get("/work", function(req, res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.post("/work", function(req, res){
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
})

app.listen(3000, function () {
  console.log("Server running at port 3000");
});
