//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-napat:test123@cluster0.fnlst7w.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item_1 = new Item({
  name: "study 1 module or more"
});

const item_2 = new Item({
  name: "find a company to internship"
});

const item_3 = new Item({
  name: "exercise 30 minute"
});

const defaultList = [item_1, item_2, item_3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, items) {
    if(items.length === 0) {
      // ***** insert default data ******
      Item.insertMany(defaultList, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("successful insert!");
      }
      });
    }

    res.render("list", {listTitle: "Today", newListItems: items});

  });

});

app.get("/:work", function(req,res){
  const workList = _.capitalize(req.params.work);

  List.findOne({name: workList}, function(err, result) {
    if(err) {
      console.log(err);
    } else if(!result) {
      const startList = new List({
        name: workList,
        items: defaultList
      });

      startList.save();
      res.redirect("/" + workList);
    } else {
      res.render("list", {listTitle: result.name, newListItems: result.items});
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, list) {
      list.items.push(item);
      list.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res) {
  const itemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(itemID, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("success delete");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemID}}}, function(err, list) {
      if(!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
