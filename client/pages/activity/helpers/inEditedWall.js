inEditedWall = function() {
  //returns truthy value 'inEditedWall' if object is in a wall currently being edited
  return (Session.get('editedWall') == this.wallID) ? 'inEditedWall' : '';
}

editing = function() {
  //returns truthy value 'editing' if ANY wall on the page is being edited
  return (Session.get('editedWall')) ? 'editing' : ''; 
}

Template.registerHelper('inEditedWall',inEditedWall);

Template.registerHelper('editing',editing);