//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB',{useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = new mongoose.Schema(
  {
  name: String
  }
)

const item = mongoose.model("item",itemSchema);

const item1 = new item({
  name: "Welcome to your To-Do-list"
});
const item2 = new item({
  name: "Click the '+' Button to add a new item."
});
const item3 = new item({
  name: "<-- Hit This to remove an Item"
});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const List = mongoose.model("list",listSchema);

app.get("/", function(req, res) {
   item.find({},function(err,foundItems){
    if(foundItems.length === 0)
    {
      item.insertMany(defaultItems,function(err){
        if(err)
        {
          console.log(err);
        } else {
          console.log("successfully inserted default items");
        }
      })
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.post("/", function(req, res){

  const userInput = req.body.newItem;
  const listTitle = req.body.list;
  const userItem = new item({
    name: userInput
  })
  if(listTitle === "Today")
  {
    userItem.save();
    res.redirect("/"); 
  } else {
    List.findOne({name: listTitle}, function(err,foundList){
      foundList.items.push(userItem);
      foundList.save();
      res.redirect("/"+listTitle);
    })
  }
});

app.post("/delete",function(req,res){
  const id = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today")
  {
    item.findByIdAndRemove(id,function(err){
      if(err)
      {
        console.log(err);
      } else {
        console.log("Successfully removed one item");
        res.redirect("/");
      }
    })
  } else {
    List.findOneAndUpdate({name: listName},{$pull: {items:{_id:id} } },function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

  
})

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName},function(err,foundList){
    if(!err)
    {
      if(!foundList)
      {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
       res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
