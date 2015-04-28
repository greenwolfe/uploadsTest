  /***********************/
 /***** SUMMERNOTE ******/
/***********************/

//ISSUE when selecting text, editor does not appear if selecting to
//left and cursor continues out of the field

Template.summernote.helpers({
  content: function() {
    if (_.isEmpty(this)) return '';
    var collection = this.collection || this.options.collection;
    var Collection = Mongo.Collection.get(collection);
    var field = this.field || this.options.field;
    var fields = {};
    fields[field] = 1;
    var _id = this._id || this.options._id;
     return Collection.findOne(_id,{field:fields})[field] || '';
  }
});

Template.summernote.onRendered(function() {
  var templateInstance = this;
  var element = this.find('div.summernote');
  if (!element) return;
  element = $(element);
  var data = this.data || {}; //options set explicitly in html template
  var options = this.data.options || {}; //options set via javascript options variable
  Object.keys(data).forEach(function(key) { //merge with priority to data
    if (key == 'options') return;
    options[key] = data[key];
  });
  data = {};
  ['collection','field','_id','enabled'].forEach(function(key){
    data[key] = options[key]; //data for meteor update
    delete options[key]; //leaves only the options to pass to summernote
  })

  var method = 'update' + _.rtrim(data.collection,'s'); //if collection = Posts, method=updatePost
  var saveText = function(event) { //called on popover blur event
    var elementID = event[0].target.id;
    var popoverVisible = false;
    ['#note-popover-','#note-handle-','#note-dialog-'].forEach(function(s) {
      var selector = elementID.replace('note-editor-',s);
      console.log(selector);
      if ($(selector).is(':visible')) {
        console.log(selector + ' is visible');
        popoverVisible = true;
        return;
      }
    });
    if (popoverVisible) return;
/*   if ($(popoverSelector).is(':visible'))
      console.log('dialog visible');
    var popover = $(popoverSelector);
    _.each(popover.children(),function(child) {
      console.log(child.id);
      console.log($(child).is(':visible'));
    })
    popoverSelector += ' .note-air-popover';
    if ($(popoverSelector).is(':visible')) //clicking on popover menus cauases a false blur event
      return;*/
    console.log('popover not visible, so going ahead'); 
    var item = {
      _id: data._id
    }
    var text = element.code();
    item[data.field] = text;
    Meteor.call(method,item,function() {
      element.code(text); //reset summernote's code to correct duplication of latest selection
    });
  }
  options.onBlur = saveText;

  //check for clicks outside open popover
  //and make sure popover is closed and save is called
  // ... second-order correction to false blur handler in save function
  $(document).click(function(event) { 
    var id = element.attr('id') || '';
    //console.log('checking' + id);
    if ($(event.target).parent().attr('id') == id) return; //clicked in edited element
    //onsole.log('did not click on ' + id);
    var popoverSelector = id.replace('note-editor-','#note-popover-'); //clicked inside associated air popover
    var popover = $(popoverSelector + 'note-air-popover'); //just the main menu part
    //console.log(popover);
    if (!popover.is(':visible')) return; //popover not open, no need to close it
    //console.log(popoverSelector + ' is open.');
    if($(event.target).closest(popoverSelector).length) return;  //clicked outside open air popover
    //console.log('did not click inside popover ' + popoverSelector);
    var handleSelector = id.replace('note-editor-','#note-handle-');
    if($(event.target).closest(handleSelector).length) return;
    //console.log('did not click a popover handle ' + handleSelector);
    var dialogSelector = id.replace('note-editor-','#note-dialog-');
    if($(event.target).closest(dialogSelector).length) return;
    //console.log('did not click air editor dialog ' + dialogSelector);
    console.log('clicked entirely outside this active (popover open) summernote, hiding and saving ' + popoverSelector)
    popover = $(popoverSelector); //getting container for link, image, air
    popover.children().hide(); //clicked outside all associated elements and popovers ... hide it
    saveText([{target:{id:'notAnElement'}}]); //and save any changes
                                             //passing false event to bypass false blur handler     
  });

  //initialize summernote ... does summernote have an enable/disable option?
  //an enable/disable method would mean we could  initialize
  //this once and deal with enable/disable with the reactive handler
  //for all options
  this.autorun(function() { //make reactive only to enabled?
    var newData = this.templateInstance().data;
    var newOptions = this.templateInstance().data.options;
    //console.log(newData);
    //console.log(newOptions);
    if (newData.enabled) { //check if summernote is enabled?
      //console.log('re-initializing summernote');
      //console.log('');
      element.summernote(options);
    } else {
      console.log('destroying summernote');
      console.log(element);
      element.destroy();
      console.log(element);
      console.log('');
    }
    //add handler to reactively change other options
    //as I did for sortable?
  })

});




