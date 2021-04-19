import React from "react";
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import List from "./List";
import Localization from "../Localization"
import NewCharacter from "./NewCharacter";

export const Start: React.FunctionComponent = () => {
  const translate = Localization.useTranslator();
  const [showNewCharacter, setShowNewCharacter] = React.useState<boolean>(false)

  const onOpenNewCharacter = function () {
    setShowNewCharacter(true);
  }
  const onCloseNewCharacter = function () {
    setShowNewCharacter(true);
  }
  return (
    <List>
      <ListItem>
        <Dialog fullScreen open={showNewCharacter} onClose={onCloseNewCharacter}>
          <NewCharacter />
        </Dialog>
        <Button variant="contained" color="primary" disableElevation fullWidth onClick={onOpenNewCharacter}>
          {translate("ui@createNewCharacter")}
        </Button>
      </ListItem>
    </List>
  )
}
export default Start