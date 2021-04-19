import React from "react"
import AvatarBase, { AvatarProps } from "@material-ui/core/Avatar"
import makeStyles from "@material-ui/core/styles/makeStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { Theme } from "@material-ui/core/styles";
import ButtonBase from '@material-ui/core/ButtonBase'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';


export function Avatar(props: Avatar.Props) {
  return <AvatarBase {...props} variant={'rounded'} />
}
export namespace Avatar {
  export type Props = Omit<AvatarProps, 'variant'>;

  export function Editor({ onSrcChange, ...props }: Editor.Props) {
    const classes = Editor.useStyles();
    const [icon, setIcon] = React.useState<{ value?: string, error?: string, img?: HTMLImageElement }>({});
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
          const src = Editor.crop(img, 512, 512).toDataURL("image/jpg", 1000)
          setIcon({ value: src, img });
          onSrcChange(src)
        }
      }
    };

    return (
      <label htmlFor="icon-upload">
        <input accept="image/*" className={classes.input} id="icon-upload" type="file" onChange={handleIconChange} />
        <ButtonBase color="primary" aria-label="upload picture" component="span">
          <Avatar {...props} aria-label="recipe" src={icon.value}>
            {icon.value ? '' : <AddAPhotoIcon fontSize="small" />}
          </Avatar>
        </ButtonBase>
      </label>
    );
  }
  export namespace Editor {
    export type Props = Avatar.Props & { onSrcChange: (value: string) => void }
    export const useStyles = makeStyles((theme: Theme) =>
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
    export function crop(src: HTMLImageElement, width: number, height: number) {
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
  }
}
export default Avatar;