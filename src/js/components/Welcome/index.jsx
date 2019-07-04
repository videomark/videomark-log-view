import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import Button from "@material-ui/core/Button";
import Input from "@material-ui/icons/Input";
import { ReactComponent as AboutHelp } from "./about-help.svg";
import { isWeb } from "../../utils/Utils";
import videoPlatforms from "../../utils/videoPlatforms.json";
import dino from "../../../images/dino.png";

const ExperimentalSnackbar = () => {
  const [open, setOpen] = useState(true);
  const onClose = () => setOpen(false);
  return (
    <Snackbar open={open} onClose={onClose} variant="info">
      <SnackbarContent message="この画面は試験的機能です。" />
    </Snackbar>
  );
};
const ImportButton = () => (
  <Button component={RouterLink} to="/import" color="primary">
    <Input />
    <Box paddingLeft={1}>計測結果をインポート...</Box>
  </Button>
);

export default () => (
  <>
    {isWeb() ? <ExperimentalSnackbar /> : null}
    <Box position="fixed" top={48} right={16}>
      <AboutHelp />
    </Box>
    <Box paddingTop={8}>
      <Grid container justify="space-between">
        <Grid item sm={6}>
          <Box paddingTop={2} paddingBottom={2}>
            <Typography component="h1" variant="h4">
              Web VideoMark
            </Typography>
            <Typography variant="subtitle1">
              ネットワークは実サービス利用時の品質で評価する時代へ
            </Typography>
            {isWeb() ? <ImportButton /> : null}
          </Box>
          <Typography component="h2" variant="h6">
            計測可能な動画配信サービス
          </Typography>
          <Box fontSize="body1.fontSize">
            <ul>
              {videoPlatforms.map(({ id, name, url }) => (
                <li key={id}>
                  <Link href={url}>{name}</Link>
                </li>
              ))}
            </ul>
          </Box>
          <Typography>
            調査対象となる動画配信サービス (
            {videoPlatforms
              .map(({ id, name, url }) => (
                <Link key={id} href={url}>
                  {name}
                </Link>
              ))
              .map((item, index) => [index > 0 && "、", item])}
            ) でいつも通り動画をお楽しみください。
          </Typography>
          <Typography>
            動画再生時のビットレート・解像度・フレームレートなどの再生品質パラメーターを記録し、動画再生の体感品質を推定します。
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box paddingTop={4} textAlign="center">
            <img src={dino} alt="dinoくん" width="300" />
          </Box>
        </Grid>
      </Grid>
    </Box>
  </>
);