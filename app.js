const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs"); //Use EJS as view engine

//Database
const connection = mongoose.createConnection("mongodb+srv://rohannayan405:rohannayan405@cluster0.r3wxou6.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = connection.model('Item', itemSchema);

const item1 = new Item({
    name : "Hit ➕ to add a new Item."
});
const item2 = new Item({
    name : "⬅️ Hit this to delete an Item."
});

const defaultItems = [item1, item2];

//Custom Lists
const listSchema = {
  name : String,
  items : [itemSchema]
};

const List = connection.model("List", listSchema);

app.get("/", function (req, res) {

  Item.find({}).then(items=>{
    //To avoid repeated insertion of defaultItems
    if(items.length===0){
      Item.insertMany(defaultItems).then(
        console.log("Added Inital Items!")
      );
      res.redirect('/');  //To again redirect the page to root route 
    }else{
      console.log(items)
      res.render("list", { listTitle: "Today", newListItems:items});
    }

  });

});

//Custom list
app.get("/:customList", function(req, res){

  const listName = _.capitalize(req.params.customList);
  List.findOne({name:listName}).then(function(foundList){
    if(!foundList){
      const list = new List({
        name: listName,
        items : defaultItems
      });
      list.save();
      console.log("Saved");
      res.redirect("/"+listName);
    }else{
      res.render("list", {listTitle: foundList.name, newListItems : foundList.items})
    }
  }).catch(function(err){});

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  //Create New Item Document
  const item = new Item({
    name : itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect('/');

  }else{
    List.findOne({name:listName}).then(foundList=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

//To Delete An Item
app.post("/delete", function(req, res){
  const checkedItem = req.body.checkBox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItem).then(
      console.log("Deleted an Item with ID: "+checkedItem),
    );
    res.redirect('/');
  }else{
     List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, {new:true})
    .then(foundList=>{
      res.redirect("/"+listName);
    });
  }
});

app.listen(3000, function () {
  console.log("Server running at port 3000");
});
