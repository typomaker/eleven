import React, { useState } from "react"
import makeStyles from "@material-ui/core/styles/makeStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { Theme } from "@material-ui/core/styles";
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Typography from '@material-ui/core/Typography'
import InputBase from '@material-ui/core/InputBase'
import Button from '@material-ui/core/Button'
import ButtonBase from '@material-ui/core/ButtonBase'
import Avatar from '@material-ui/core/Avatar'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import Alert from '@material-ui/lab/Alert';
import Localization from "../Localization"
import Configuration from '../Configuration';
import CardHeader from '@material-ui/core/CardHeader';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    input: {
      display: "none",
    },
    avatar: {
      backgroundColor: theme.palette.secondary.main,
      width: 60,
      height: 60,
    },
  }),
);

export const AvatarSelect: React.FunctionComponent = () => {
  const classes = useStyles();
  const [icon, setIcon] = useState<{ value?: string, error?: string, img?: HTMLImageElement }>({});
  const handleIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const reader = new FileReader()
    reader.readAsDataURL(event.target.files[0]);
    const target = event.target;
    reader.onloadend = function () {
      if (!reader.result) {
        setIcon({});
        return;
      }
      const img = new Image();
      img.src = reader.result.toString();
      img.onload = () => {
        const src = crop(img, 512, 512).toDataURL("image/jpg", 1000)
        setIcon({ value: src, img });
      }
    }
  };
  function crop(src: HTMLImageElement, width: number, height: number) {
    var crop = width == 0 || height == 0;
    if (src.width <= width && height == 0) {
      width = src.width;
      height = src.height;
    }
    if (src.width > width && height == 0) {
      height = src.height * (width / src.width);
    }

    var xscale = width / src.width;
    var yscale = height / src.height;
    var scale = crop ? Math.min(xscale, yscale) : Math.max(xscale, yscale);

    var canvas = document.createElement("canvas");
    canvas.width = width ? width : Math.round(src.width * scale);
    canvas.height = height ? height : Math.round(src.height * scale);
    const ctx2d = canvas.getContext("2d")!;
    canvas.getContext("2d")!.scale(scale, scale);
    // crop it top center
    canvas.getContext("2d")!.drawImage(src, ((src.width * scale) - canvas.width) * -.5, ((src.height * scale) - canvas.height) * -.5);
    return canvas;
  }
  return (
    <label htmlFor="icon-upload">
      <input accept="image/*" className={classes.input} id="icon-upload" type="file" onChange={handleIconChange} />
      <ButtonBase color="primary" aria-label="upload picture" component="span">
        <Avatar variant={"rounded"} aria-label="recipe" className={classes.avatar} src={icon.value}>
          {icon.value ? '' : <AddAPhotoIcon fontSize="small" />}
        </Avatar>
      </ButtonBase>
    </label>
  );
} 