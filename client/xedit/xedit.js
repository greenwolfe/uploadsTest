/* In addition to standard xedit parameters, must pass in:

  collection: collection to be updated
  field:      field of collection to update
  _id:        _id of item in collection
  method:    (optional) name of update method to be called
             for collection Blocks, defaults to updateBlock if
             no method explicitly passed

And may pass in:
  enabledEmptyText:   text that appears when editor is enabled and content is empty
  enabledState: 'enabled' or 'disabled' reactive variable causing editor to be enabled or disabled

The following two standard parameters are often passed in
  type:        'text' is default, also wysihtml, textarea
  mode:        'inline' is default, also 'popup'
*/

Template.xedit.helpers({
  content: function() {
    if (_.isEmpty(this)) return '';
    var collection = this.collection || this.options.collection;
    var Collection = Mongo.Collection.get(collection);
    var field = this.field || this.options.field;
    var fields = {};
    fields[field] = 1;
    var _id = this._id || this.options._id;
    var emptytext = '&nbsp;';
    var enabledState = this.enabledState || this.options.enabledState || 'enabled';
    if (enabledState == 'enabled')
      emptytext = this.enabledEmptyText || this.options.enabledEmptyText || 'Click to edit.';
    return Collection.findOne(_id,{field:fields})[field] || emptytext;
  },
  isEmbedCode: function() {
    if (_.isEmpty(this)) return false;
    var field = this.field || this.options.field;
    return (field == 'embedCode');
  }
});

Template.xedit.onRendered(function() {
  var container = $(this.find('.editable'));
  var data = this.data || {}; //options sent explicitly in html template
  var options = this.data.options || {}; //options sent via javascript options variable
  Object.keys(data).forEach(function(key) { //merge with priority to data
    if (key == 'options') return;
    options[key] = data[key];
    delete data[key];
  });
  options.type = options.type || 'text';
  var width = options.width || '200px'; 
  if (options.type == 'text') {
    _.extend(options,{
      rows: options.rows || 0,
      tpl: "<input type='text' style='width: " + width + "'>",
      mode: options.mode || 'inline',
      showbuttons: options.showbuttons || 'right',
      placement: options.placement || 'bottom'
    });
  } else if (options.type == 'wysihtml5') {
    _.extend(options,{
      rows: options.rows || 0,
      tpl: "<textarea></textarea>",
      mode: options.mode || 'popup',
      showbuttons: options.showbuttons || 'top',
      placement: options.placement || 'bottom'
      /*wysihtml5: { // how to get this working?
        'lists':true,
        'link':true
      },*/
    });    
  } else   if (options.type == 'textarea') {
    _.extend(options,{
      tpl: "<textarea></textarea>",
      rows: options.rows || 5,
      mode: options.mode || 'inline',
      showbuttons: options.showbuttons || 'top',
      placement: options.placement || 'bottom'
    });
  };
  options.disabled = (options.enabledState == 'disabled') || false;
  options.unsavedclass = null; //don't make text bold, etc. after editing
  options.display = false; //xedit does not display any values, leaves it to meteor helper
  var Collection = Mongo.Collection.get(options.collection);
  var field = options.field;
  var fields = {};
  fields[field] = 1;
  options.value = Collection.findOne(options._id,{field:fields})[field] || ''; //xedit does not display initial value, leaves it to meteor helper
  options.success = function(response,newValue) {
      var method = 'update' + _.rtrim(options.collection,'s');
      var item = {
        _id: options._id
      }
      item[options.field] = newValue
      Meteor.call(method,item);
  };
  container.editable(options);
  container.on('save',function(e,params) {
    e.preventDefault();
  });

  //make sure this helper does not run until the template
  //is rendered ... avoids error
  //couldn't figure out how to get to options from simple autorun
  //so using this dummy helper where I knew how to get access and it
  //is already reactive.  Value passed is not used
  Template.xedit.helpers({
    disabled: function() { 
      if (_.isEmpty(this)) return 'true';
      var enabledState = this.enabledState || this.options.enabledState || 'enabled';
      var template = Template.instance();
      var container = null;
      if (template) 
        //non-fatal errror occurs on this line ... why?
        var container = $(template.find('.editable')) || null;
      if (container) {
        if (enabledState == 'disabled') {
          container.editable('disable');
        } else {
          container.editable('enable');
        }
      }
      return (enabledState == 'enabled') ? 'false' : 'true';
    }
  });
});