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
    ['#note-popover-','#note-dialog-'].forEach(function(s) {
      var selector = elementID.replace('note-editor-',s);
      _.each($(selector).children(),function(c) {
        if ($(c).is(':visible')) {
          popoverVisible = true
          return false;
        }
      })
    });
    if (popoverVisible) return;
    //popover not visible so go ahead and save
    //if the popover is visible when a click event occurs 
    //outside of the element and all associated popovers and dialogs,
    //this function is called with a false even that passes through
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
    var elementID = element.attr('id') || '';
    if ($(event.target).parent().attr('id') == elementID) return; //clicked in edited element
    var popoverVisible = false; //check if this popover is visible
    var clickedIn = false;  //check if click was inside the popover or related menus or dialogs
    ['#note-popover-','#note-dialog-'].forEach(function(s) {
      var selector = elementID.replace('note-editor-',s);
      if($(event.target).closest(selector).length) {
        clickedIn = true;
        return false;
      }
      _.each($(selector).children(),function(c) {
        if ($(c).is(':visible')) {
          popoverVisible = true
          return false;
        }
      })
    });
    if (!popoverVisible) return; //click outside of element will be caught with normal blur event
    if (clickedIn) return; //clicked one of the popover's menus, buttons or dialogs ... don't save

    var popoverSelector = elementID.replace('note-editor-','#note-popover-'); 
    popover = $(popoverSelector); //getting container for link, image, air
    popover.children().hide(); //clicked outside all associated elements and popovers ... hide it
    saveText([{target:{id:'notAnElement'}}]); //and save any changes
                                             //passing false event to bypass false blur handler     
  });

  //summernote has no enable/disable method, so we create and 
  //destroy based on the reactive variable enabled
  this.autorun(function() { //make reactive only to enabled?
    var newData = this.templateInstance().data;
    var newOptions = this.templateInstance().data.options;
    if (newData.enabled) { //check if summernote is enabled?
      element.summernote(options);
    } else {
      element.destroy();
    }
    //add handler to reactively change other options
    //as I did for sortable?
  })

});




