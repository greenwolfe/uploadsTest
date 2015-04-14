Meteor.methods({
  show: function(collection,_id,show) {
    if (!collection) 
      throw new Meteor.Error(332,"Cannot show/hide item.  Invalid collection.");
    var Collection = Mongo.Collection.get(collection);
    if (!Collection)
      throw new Meteor.Error(333,"Cannot show/hide item.  Invalid collection.");
    var item = Collection.findOne(_id);
    if (!item)
      throw new Meteor.Error(330,"Cannot show/hide item, invalid id.");
    if (_.isBoolean(show)) {
      Collection.update(_id,{$set: {visible:show}});
    } else {
      throw new Meteor.Error(334,"Cannot show/hide item, status not boolean.");
    }
  }
});