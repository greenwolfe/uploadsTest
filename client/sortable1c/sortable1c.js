//todo:  Make this generic so the collection name, sort field, and key 
//can be passed in ... i.e. use with bocks and with activities
Template.sortable1c.onRendered(function() {
  var templateInstance = this;
  var el = this.firstNode.parentElement;
  if (!el) return;
  Sortable.create(el,{
    draggable:'.block',
    handle: '.panel-heading',
    group: 'column',
    onUpdate: function(evt) {
      var item = evt.item
      var block = Blaze.getData(item); 
      if (evt.newIndex < evt.oldIndex) { //moved up
        var orderNextItem = Blaze.getData(item.nextElementSibling).order;
        Meteor.call('moveBlockWithinList',block._id,null,orderNextItem);  
      } else if (evt.newIndex > evt.oldIndex) { //moved down
        var orderPrevItem = Blaze.getData(item.previousElementSibling).order;
        Meteor.call('moveBlockWithinList',block._id,orderPrevItem,null);
      } else {
        //do nothing - drag and drop in same location
      }
    },
    onAdd: function(evt) {
      var item = evt.item
      var block = Blaze.getData(item);
      var columnID = templateInstance.data.options.columnID;
      var sibling = item.nextElementSibling;
      var orderNextItem = null;
      if (sibling) orderNextItem = Blaze.getData(sibling).order;
      Meteor.call('moveBlockToNewColumn',block._id,columnID,orderNextItem);
    }
  });
});