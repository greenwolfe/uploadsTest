/*
matching a specific value for selectField defines a subset of 
collection that is ordered by sortField and rendered in a 
single list in the DOM. These methods handle the situation 
where an item is dragged and dropped within the list (sortItem) 
and when it is dragged to another linked list (moveItem).

to do:  
  routines to handle adding and removing an item?
  allow passing a more general selector rather than just one field?

*/

Meteor.methods({
  sortItem: function(collection,itemID,sortField,selectField,orderPrevItem,orderNextItem) {
    var sortField = sortField || 'order';
    if (!collection) 
      throw new Meteor.Error(232,"Cannot sort collection.  Invalid collection.");
    console.log(collection);
    var Collection = Mongo.Collection.get(collection);
    if (!Collection)
      throw new Meteor.Error(233,"Cannot sort collection.  Invalid collection.");
    var item = Collection.findOne(itemID);
    if (!item)
      throw new Meteor.Error(230,"Cannot sort collection, invalid item.");
    if (!(sortField in item))
      throw new Meteor.Error(235,"Cannot sort collection, item does not have sort field.");
    var startOrder = item[sortField];
    if (!(selectField in item))
      throw new Meteor.Error(236,"Cannot sort collection, item does not have selection field.");
    var selectValue = item[selectField];
    var selector = {};
    selector[selectField] = selectValue;
    var ids = [];
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
  moveItem: function(collection,itemID,sortField,selectField,selectValue,orderNextItem) {
    var sortField = sortField || 'order';
    if (!collection) 
      throw new Meteor.Error(232,"Cannot sort collection.  Invalid collection.");
    var Collection = Mongo.Collection.get(collection);
    if (!Collection)
      throw new Meteor.Error(233,"Cannot sort collection.  Invalid collection.");
    var item = Collection.findOne(itemID);
    if (!item)
      throw new Meteor.Error(230,"Cannot sort collection, invalid item.");
    var startOrder = item[sortField];
    if (!(sortField in item))
      throw new Meteor.Error(237,"Cannot sort collection, no order field present.");
    if (!(selectField in item))
      throw new Meteor.Error(236,"Cannot sort collection, item does not have selection field.");
    var oldSelectValue = item[selectField];
    
    var selector = {};
    var ids = [];
    var updateOperator = {};

    //removing item from old list
    selector[selectField] = oldSelectValue;
    selector[sortField] = {$gt: startOrder};
    var ids = _.pluck(Collection.find(selector,{fields: {_id: 1}}).fetch(), '_id'); 
    updateOperator[sortField] = -1;
    Collection.update({_id: {$in: ids}}, {$inc: updateOperator}, {multi: true});

    //adding item to new list
    if (_.isFinite(orderNextItem) && orderNextItem >= 0) {  // placed somewhere in middle
      selector[selectField] = selectValue;
      selector[sortField] = {$gte: orderNextItem};
      ids = _.pluck(Collection.find(selector,{fields: {_id: 1}}).fetch(), '_id');
      updateOperator[sortField] = 1;
      Collection.update({_id: {$in: ids}}, {$inc: updateOperator}, {multi: true});
    } else { // place at end or place as first block in empty column
      selector = {};
      selector[selectField] = selectValue;   //find highest-ranked item in new parent  
      last = Collection.findOne(selector,{sort:{order:-1}});
      orderNextItem = (last && (sortField in last)) ? last[sortField] + 1 : 0;
    }
    updateOperator = {};
    updateOperator[selectField] = selectValue;
    Collection.update(item._id,{$set: updateOperator});   
    updateOperator = {};
    updateOperator[sortField] = orderNextItem;   
    Collection.update({_id:item._id},{$set: updateOperator});
  }
});