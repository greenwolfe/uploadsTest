/* In addition to standard sortable parameters, must pass in:

  collection: mongoDB name of the collection of items to be updated (example:  Blocks)
            ****NOTE THIS IS THE MONGODB NAME, which may not be the same as the meteor variable
            ****referencing that collection
  sortField:  field used to select a subset of the collection
  sortValue:  value that defines this particular subset
  NOTE:  the items must the this particular subset of the collection

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
      evt.stopPropagation(); //in case nested sortables
      console.log('onUpdate');
      console.log(evt);
      var item = evt.item;
      var itemData = Blaze.getData(item);
      console.log(Blaze.getData(item.previousElementSibling));
      console.log(itemData);
      console.log(Blaze.getData(item.nextElementSibling))
      if (evt.newIndex < evt.oldIndex) { //moved up
        var orderNextItem = Blaze.getData(item.nextElementSibling)[options.sortField];
        Meteor.call('sortItem',options.collection,itemData._id,options.sortField,options.selectField,null,orderNextItem);  
      } else if (evt.newIndex > evt.oldIndex) { //moved down
        var orderPrevItem = Blaze.getData(item.previousElementSibling)[options.sortField];
        Meteor.call('sortItem',options.collection,itemData._id,options.sortField,options.selectField,orderPrevItem,null);
      } else {
        //do nothing - drag and drop in same location
      }
    },
    onAdd: function(evt) {
      evt.stopPropagation(); //in case nested sortables
      var item = evt.item
      var itemData = Blaze.getData(item);
      var sibling = item.nextElementSibling;
      var orderNextItem = null;
      if (sibling) orderNextItem = Blaze.getData(sibling)[options.sortField];
      Meteor.call('moveItem',options.collection,itemData._id,options.sortField,options.selectField,options.selectValue,orderNextItem);
    }
  });
  Sortable.create(el,options);
});