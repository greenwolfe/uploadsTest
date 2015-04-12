/*
parentCollection defines a subset of collection that is ordered
by sortField and rendered in a single list in the DOM.
These methods handle the situation where an item is dragged
and dropped within the list (sortItem) and when it is dragged
to another linked list (moveItem).

to do:  routines to handle adding and removing an item?

*/

Meteor.methods({
  sortItem: function(collection,itemID,sortField,parentCollection,orderPrevItem,orderNextItem) {
    var sortField = sortField || 'order';
    if (!collection) 
      throw new Meteor.Error(232,"Cannot sort collection.  Invalid collection.");
    var Collection = Mongo.Collection.get(collection);
    if (!Collection)
      throw new Meteor.Error(233,"Cannot sort collection.  Invalid collection.");
    var item = Collection.findOne(itemID);
    if (!item)
      throw new Meteor.Error(230,"Cannot sort collection, invalid item.");
    if (!parentCollection)
      throw new Meteor.Error(234,"Cannot sort collection.  Invalid parent collection.");
    var ParentCollection = Mongo.Collection.get(parentCollection);
    if (!ParentCollection) 
      throw new Meteor.Error(235,"Cannot sort collection.  Invalid parent.");
    //parentCollection = Columns => parentIDField = columnID 
    var parentIdField = _.rtrim(parentCollection,'s') + 'ID';
    parentIdField = parentIdField.charAt(0).toLowerCase() + parentIdField.substring(1);
    if (!(parentIdField in item))
      throw new Meteor.Error(236,"Cannot sort collection, invalid parent ID field.")
    var parentID = item[parentIdField];
    var parent = ParentCollection.findOne(parentID);
    if (!parent)
      throw new Meteor.Error(231,"Cannot sort collection, invalid parent.");
    var ids = [];
    if (!(sortField in item))
      throw new Meteor.Error(237,"Cannot sort collection, no order field present.");
    var startOrder = item[sortField];
    var selector = {};
    selector[parentIdField] = parentID;
    var updateOperator = {};

    if (orderPrevItem != null) {  // Element moved down, so decrease intervening order fields and place moved block in cleared space.
      selector[sortField] = {$lte: orderPrevItem, $gt: startOrder};
      ids = _.pluck(Collection.find(selector,{fields: {_id: 1}}).fetch(), '_id');
      updateOperator[sortField] = -1;
      Collection.update({_id: {$in: ids}}, {$inc: updateOperator}, {multi: true});
      updateOperator[sortField] = orderPrevItem;
      Collection.update({_id:itemID},{$set: updateOperator});
    } else if (orderNextItem != null) {  // Element moved up, so increase intervening order fields and place moved block in cleared space.
      selector[sortField] = {$gte: orderNextItem, $lt: startOrder};
      ids = _.pluck(Collection.find(selector,{fields: {_id: 1}}).fetch(), '_id');
      updateOperator[sortField] = 1;
      Collection.update({_id: {$in: ids}}, {$inc: updateOperator}, {multi: true});
      updateOperator[sortField] = orderNextItem;
      Collection.update({_id:itemID},{$set: updateOperator});
    } 
  },
  moveItem: function(collection,itemID,sortField,parentCollection,parentID,orderNextItem) {
    var sortField = sortField || 'order';
    if (!collection) 
      throw new Meteor.Error(232,"Cannot sort collection.  Invalid collection.");
    var Collection = Mongo.Collection.get(collection);
    if (!Collection)
      throw new Meteor.Error(233,"Cannot sort collection.  Invalid collection.");
    var item = Collection.findOne(itemID);
    if (!item)
      throw new Meteor.Error(230,"Cannot sort collection, invalid item.");
    if (!(sortField in item))
      throw new Meteor.Error(237,"Cannot sort collection, no order field present.");
    if (!parentCollection)
      throw new Meteor.Error(234,"Cannot sort collection.  Invalid parent collection.");
    var ParentCollection = Mongo.Collection.get(parentCollection);
    if (!ParentCollection) 
      throw new Meteor.Error(235,"Cannot sort collection.  Invalid parent.");
    var ids = [];
    var selector = {};
    var updateOperator = {};

    //removing item from old parent, parentCollection = Columns => parentIDField = columnID 
    var parentIdField = _.rtrim(parentCollection,'s') + 'ID';
    parentIdField = parentIdField.charAt(0).toLowerCase() + parentIdField.substring(1);
    if (!(parentIdField in item))
      throw new Meteor.Error(236,"Cannot sort collection, invalid parent ID field.")
    var oldParentID = item[parentIdField];
    var parent = ParentCollection.findOne(oldParentID);
    if (!parent)
      throw new Meteor.Error(231,"Cannot sort collection, invalid parent.");
    selector[parentIdField] = oldParentID;
    selector[sortField] = {$gt: item[sortField]};
    var ids = _.pluck(Collection.find(selector,{fields: {_id: 1}}).fetch(), '_id'); 
    updateOperator[sortField] = -1;
    Collection.update({_id: {$in: ids}}, {$inc: updateOperator}, {multi: true});


    //adding item to new parent collection
    var parent = ParentCollection.findOne(parentID);
    if (!parent)
      throw new Meteor.Error(231,"Cannot sort collection, invalid parent.");
    if (_.isFinite(orderNextItem) && orderNextItem >= 0) {  // placed somewhere in middle
      selector[parentIdField] = parentID;
      selector[sortField] = {$gte: orderNextItem};
      ids = _.pluck(Collection.find(selector,{fields: {_id: 1}}).fetch(), '_id');
      updateOperator[sortField] = 1;
      Collection.update({_id: {$in: ids}}, {$inc: updateOperator}, {multi: true});
    } else { // place at end or place as first block in empty column
      selector = {};
      selector[parentIdField] = parentID;   //find highest-ranked item in new parent  
      last = Collection.findOne(selector,{sort:{order:-1}});
      orderNextItem = (last) ? last.order + 1 : 0;
    }
    updateOperator = {};
    updateOperator[parentIdField] = parentID;
    Collection.update(item._id,{$set: updateOperator});   
    updateOperator = {};
    updateOperator[sortField] = orderNextItem;   
    Collection.update({_id:item._id},{$set: updateOperator});
  }
});