//todo:  Make this generic so the collection name, sort field, and key 
//can be passed in ... i.e. use with blocks and with activities
//in addition to passing in draggable, handle, group, must pass
//make generic handler ala how I did it in xedit
//use generic name instead of block, collection?
//pass in method name

/* In addition to standard sortable parameters, must pass in:

  collection: collection of items to be updated (example:  Blocks)
  parentCollection:  collection of containers for the items (example: Columns)


And may pass in:
  sortField: (optional) field of collection to update, defaults to order
  
The following standard parameters are often passed in
draggable: css specifier for draggable element
handle: css specifier for handle part of draggable
group:  css specifier (minus the .) for group if allowing dragging
         from one list to another (required?  what if not present?)
*/

Template.sortable1c.onRendered(function() {
  var templateInstance = this;
  var el = this.firstNode.parentElement;
  if (!el) return;
  var options = this.data.options || {};  //it appears handlebars automatically merges anything 
    //explicitly in the html data (excluding items) with anything in an options object passed from javascript.  
    //conflicts are resolved in favor of the explicit data
  options.sortField = options.sortField || 'order';
  _.extend(options,{
    onUpdate: function(evt) {
      var item = evt.item
      var itemData = Blaze.getData(item); 
      if (evt.newIndex < evt.oldIndex) { //moved up
        var orderNextItem = Blaze.getData(item.nextElementSibling).order;
        Meteor.call('sortItem',options.collection,itemData._id,options.sortField,options.parentCollection,null,orderNextItem);  
      } else if (evt.newIndex > evt.oldIndex) { //moved down
        var orderPrevItem = Blaze.getData(item.previousElementSibling).order;
        Meteor.call('sortItem',options.collection,itemData._id,options.sortField,options.parentCollection,orderPrevItem,null);
      } else {
        //do nothing - drag and drop in same location
      }
    },
    onAdd: function(evt) {
      var item = evt.item
      var itemData = Blaze.getData(item);
      var sibling = item.nextElementSibling;
      var orderNextItem = null;
      if (sibling) orderNextItem = Blaze.getData(sibling)[options.sortField];
      Meteor.call('moveItem',options.collection,itemData._id,options.sortField,options.parentCollection,options.parentID,orderNextItem);
    }
  });
  Sortable.create(el,options);
});