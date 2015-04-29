//make some blocks that are group or section editable?
 /**********************/
 /******* HELPERS ******/
/**********************/
var inEditedWall = function(gen) {
  gen = gen || 1;
  return (Session.get('editedWall') == Template.parentData(gen).wallID) ? 'inEditedWall' : '';
}
var validateFiles = function(files) {
  return (_.max(_.pluck(files,'size')) < 1e8);  //100MB
}
var summernoteOptions = function() {
  return {
    airMode: true,
    airPopover: [
      ['style',['style']],
      ['color', ['color']],
      ['fontname', ['fontname']],
      ['fontsize', ['fontsize']],
      ['supersub', ['superscript','subscript']],
      ['font', ['bold', 'italic', 'strikethrough', 'underline', 'clear']],
      ['para', ['ul', 'ol', 'paragraph']],
      ['table', ['table']],
      ['insert', ['link'/*, 'picture','video'*/]],
      //['undoredo', ['undo','redo']], //leaving out for now ... not clear what is undone ... not a large queue of past changes, and ctrl-z, ctrl-shift-z reacts more like what you would expect
      ['other',[/*'codeview','fullscreen',*/'help','hide']]
      //ISSUE codeview, fullscreen, not working ... do they work from toolbar and just not from air mode?
      //ISSUE video works, but can't resize it, no context menu as for image
      //ISSUE no link to image to bring up larger view
      //leaving out image and video for now, can use image and video blocks until this is better
    ]
  }
}
//to use:  genericCallbacks: {validate: validateFiles},

  /**********************/
 /******* BLOCK** ******/
/**********************/


Template.block.helpers({
  blockType: function() {
    return Template[this.type + 'Block'];
  },
  inEditedWall: inEditedWall,
  editing: function() {
    return Session.get('editedWall') ? 'editing' : ''; //returns 'editing' if ANY wall on the page is being edited
  },
  fileCount: function() {
    var selector = {blockID:this._id};
    if (!inEditedWall()) //if not editing
      selector.visible = true //show only visible blocks
    return Files.find(selector).count();
  },
  virtualWorkStatus: function() {
    return 'icon-raise-virtual-hand';
  },
  summernoteOptions: function() {
    return {
      airMode: true,
      airPopover: [ //shorter set of options for title
        ['style',['style']],
        ['color', ['color']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']], 
        ['supersub', ['superscript','subscript']],
        ['font', ['bold', 'italic', 'underline', 'clear']],
        ['para', ['paragraph']],
        ['insert', ['link']],
        //['undoredo', ['undo','redo']], //leaving out for now ... not clear what is undone ... not a large queue of past changes
        ['other',['help','hide']]
      ]      
    }
  }
});

Template.block.events({
  'click .deleteBlock':function() {
    if (confirm('Are you sure you want to delete this block?')) {
      Meteor.call('deleteBlock', this._id);
    }
  },
  'click .copyBlock': function(event,tmpl) {
    if (!event.ctrlKey) { //clear the clipboard
      ClipboardBlocks.find().forEach(function(block) {
        ClipboardBlocks.remove(block._id);
      });
    } //else do nothing ... add block to clipboard
    var block = this;
    block.idFromCopiedBlock = block._id;
    block.order = ClipboardBlocks.find().count() + 1;
    delete block._id;
    delete block.columnID;
    ClipboardBlocks.insert(block);
  }
});

  /**********************/
 /***** TEXTBLOCK ******/
/**********************/

Template.textBlock.helpers({
  inEditedWall: inEditedWall,
  summernoteOptions: summernoteOptions
});

  /**********************/
 /**** EMBEDBLOCK ******/
/**********************/
Template.embedBlock.helpers({
  inEditedWall: inEditedWall,
  summernoteOptions: summernoteOptions,
  codeviewOptions: function() {
    return {
      toolbar: [
        ['codeview',['codeview']]
      ]     
    }
  },
  embedCodeWithNoScript: function() {
    if (!this.embedCode) return false;
    if (_.str.include(this.embedCode,'<script')) {
      return 'This embed code contains javascript and has been blocked because some embedded javascript makes the site hang up.  If you are trying to aggregate and poste rss, atom or twitter feeds, use the feed block.';
    } else {
      return this.embedCode;
    }
  }
});

/* to embed javascript ... currently disabled as
some javascript seems to hang the site, even
when loaded after rendering as below
Template.embedBlock.onRendered(function() {
  if (!this.data.embedCode) return;
  if (_.str.include(this.data.embedCode,'<script')) {
    var el = this.firstNode.parentElement;
    //$(el).prepend(this.data.embedCode);
  }
});*/

  /**********************/
 /**** IMAGEBLOCK ******/
/**********************/

Template.imageBlock.helpers({
  imageFile: function() {
    var selector = {blockID:this._id};
    if (!inEditedWall()) //if not editing
      selector.visible = true //show only visible blocks
    return Files.findOne(selector,{sort: {order:1}});
  },
  inEditedWall: inEditedWall,
  summernoteOptions: summernoteOptions,
  processUpload: function() {
    var blockID = this._id
    return {
      finished: function(index, file, tmpl) {
        file.blockID = blockID;
        console.log(file);
        var fileId = Meteor.call('insertFile',file);
      },
      validate: function(files) {
        var valid = true;
        files.forEach(function(file) {
          if ((file.size > 1e8) || (file.type.indexOf('image') < 0))
            valid = false;
        });
        return valid;
      }
    }
  }
});

  /*****************************/
 /**** delete Image File ******/
/*****************************/

Template.deleteImageButton.events({
  'click .deleteImageFile': function(event,tmpl) {
    if (confirm('if this is the last link to this image, \nthe image file itself will also be deleted.  \nAre you sure you want to delete this link?'))
      Meteor.call('deleteFile', this._id);
  }
});

  /**********************/
 /**** FILEBLOCK *******/
/**********************/

Template.fileBlock.helpers({
  inEditedWall: inEditedWall,
  summernoteOptions: summernoteOptions,
  files: function() {
    var selector = {blockID:this._id};
    if (!inEditedWall()) //if not editing
      selector.visible = true //show only visible blocks
    return Files.find(selector,{sort: {order:1}});
  },
  processUpload: function() {
    var blockID = this._id
    return {
      finished: function(index, file, tmpl) {
        file.blockID = blockID;
        var fileId = Meteor.call('insertFile',file);
      },
      validate: validateFiles
    }
  },
  sortableOpts: function() {
    return {
      draggable:'.file',
      handle: '.moveFile',
      collection: 'Files',
      selectField: 'blockID',
      selectValue: this._id
    }
  }
});

  /**********************/
 /**** FILELINK  *******/
/**********************/

Template.fileLink.helpers({
  inEditedWall: inEditedWall
});

Template.fileLink.events({
  'click .deleteFile':function(event,template) {
    if (confirm('If this is the last link to this file, \nthe file itself will also be deleted.  \nAre you sure you want to delete this link?')) {
      Meteor.call('deleteFile', this._id);
    }
  }
})
