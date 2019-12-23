import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useHistory, useLocation } from "react-router";
import { styled } from "@material-ui/styles";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import AppBar from "@material-ui/core/AppBar";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Close from "@material-ui/icons/Close";
import Paper from "@material-ui/core/Paper";
import MuiList from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ArrowRight from "@material-ui/icons/ArrowRight";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import MuiDialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Checkbox from "@material-ui/core/Checkbox";
import Slider from "@material-ui/core/Slider";
import TextField from "@material-ui/core/TextField";
import uuidv4 from "uuid/v4";
import addYears from "date-fns/addYears";
import formatDistanceStrict from "date-fns/formatDistanceStrict";
import locale from "date-fns/locale/ja";
import ThemeProvider from "./js/components/ThemeProvider";
import {
  clearStore as clearStatsCache,
  getStoredIndex as getStatsCacheIndex
} from "./js/containers/StatsDataProvider";
import {
  useSession,
  useSettings,
  clearViewings
} from "./js/utils/ChromeExtensionWrapper";

const List = styled(MuiList)({
  padding: 0
});

const Header = () => {
  const history = useHistory();
  const close =
    history.length > 1 ? () => history.goBack() : () => window.close();

  return (
    <AppBar color="default">
      <Box
        height={48}
        component={Grid}
        container
        alignItems="center"
        justify="space-between"
      >
        <Grid item>
          <Box paddingLeft={6} />
        </Grid>
        <Grid item>
          <Typography component="h1" variant="h6">
            設定
          </Typography>
        </Grid>
        <Grid item>
          <IconButton color="primary" onClick={close}>
            <Close color="action" />
          </IconButton>
        </Grid>
      </Box>
    </AppBar>
  );
};

const Dialog = ({
  title,
  description,
  disagree,
  agree,
  open,
  onClose,
  onAgree
}) => (
  <MuiDialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{description}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        {disagree}
      </Button>
      <Button
        onClick={(...args) => {
          onAgree(...args);
          onClose(...args);
        }}
        color="secondary"
        autoFocus
      >
        {agree}
      </Button>
    </DialogActions>
  </MuiDialog>
);
Dialog.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  disagree: PropTypes.string.isRequired,
  agree: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAgree: PropTypes.func.isRequired
};

const useDialog = () => {
  const [dialog, setDialog] = useState(null);
  const openDialog = useCallback(
    (type, handler) => {
      const onClose = () => {
        setDialog(null);
      };
      switch (type) {
        case "resetSession":
          return setDialog(
            <Dialog
              open
              title="セッションIDをリセットします"
              description="現在使われているセッションIDを削除し、新しいセッションIDを生成します。"
              disagree="キャンセル"
              agree="リセット"
              onClose={onClose}
              onAgree={handler}
            />
          );
        case "clearViewings":
          return setDialog(
            <Dialog
              open
              title="計測履歴を削除します"
              description={[
                "計測履歴と統計グラフのキャッシュを削除します。",
                "ただし、サーバーに保存されているデータは残ります。"
              ].join("")}
              disagree="キャンセル"
              agree="削除"
              onClose={onClose}
              onAgree={handler}
            />
          );
        case "clearStatsCache":
          return setDialog(
            <Dialog
              open
              title="統計グラフのキャッシュを削除します"
              description="統計グラフのパフォーマンス改善のために使用されている一時データを削除します。"
              disagree="キャンセル"
              agree="削除"
              onClose={onClose}
              onAgree={handler}
            />
          );
        case "resetSettings":
          return setDialog(
            <Dialog
              open
              title="設定のリセット"
              description={[
                "設定を既定値にリセットします。",
                "セッションIDと統計グラフのキャッシュを削除します。",
                "ただし、計測結果とその履歴はそのまま残ります。"
              ].join("")}
              disagree="キャンセル"
              agree="リセット"
              onClose={onClose}
              onAgree={handler}
            />
          );
        default:
          return setDialog(null);
      }
    },
    [setDialog]
  );

  return [dialog, openDialog];
};

const PrivacySettings = ({ settings, session, saveSession }) => {
  const { expires_in: expiresIn } = settings === undefined ? {} : settings;
  const { id: sessionId } = session === undefined ? { id: "..." } : session;
  const [dialog, openDialog] = useDialog();
  const openResetSessionDialog = useCallback(
    () =>
      openDialog("resetSession", () =>
        saveSession({
          id: uuidv4(),
          expires: Date.now() + (Number.isFinite(expiresIn) ? expiresIn : 0)
        })
      ),
    [openDialog, saveSession, expiresIn]
  );
  const openClearViewingsDialog = useCallback(
    () =>
      openDialog("clearViewings", () => {
        clearStatsCache();
        clearViewings();
      }),
    [openDialog]
  );
  const openStatsCacheDialog = useCallback(
    () => openDialog("clearStatsCache", () => clearStatsCache()),
    [openDialog]
  );

  return (
    <Box marginY={4}>
      <Box marginY={1}>
        <Typography component="h3" variant="body1">
          プライバシー
        </Typography>
      </Box>
      <Paper>
        {dialog}
        <List>
          <ListItem>
            <ListItemText
              primary="セッションID"
              secondary={sessionId === undefined ? "未設定" : sessionId}
            />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText
              primary="セッション保持期間"
              secondary={
                expiresIn > 0
                  ? formatDistanceStrict(0, expiresIn, { unit: "day", locale })
                  : "新しいページを読み込むまで"
              }
            />
          </ListItem>
          <Divider component="li" />
          <ListItem
            button
            onClick={openResetSessionDialog}
            disabled={sessionId === undefined}
          >
            <ListItemText primary="セッションIDのリセット" />
            <ArrowRight />
          </ListItem>
          <Divider component="li" />
          <ListItem button onClick={openClearViewingsDialog}>
            <ListItemText primary="計測履歴の削除" />
            <ArrowRight />
          </ListItem>
          <Divider component="li" />
          <ListItem
            button
            onClick={openStatsCacheDialog}
            disabled={getStatsCacheIndex().size === 0}
          >
            <ListItemText primary="統計グラフのキャッシュを削除" />
            <ArrowRight />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};
PrivacySettings.propTypes = {
  settings: PropTypes.shape({}),
  session: PropTypes.shape({}),
  saveSession: PropTypes.instanceOf(Function)
};
PrivacySettings.defaultProps = {
  settings: undefined,
  session: undefined,
  saveSession: undefined
};

const BitrateControlSettings = ({ settings, saveSettings }) => {
  const useStyles = makeStyles(theme => ({
    nested6: {
      paddingLeft: theme.spacing(6)
    },
    nested12: {
      paddingLeft: theme.spacing(12)
    },
    slider: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4)
    }
  }));
  const classes = useStyles();

  const resolutionMarks = [
    {
      value: 0,
      label: "144p",
      resolution: 144
    },
    {
      value: 1,
      label: "240p",
      resolution: 240
    },
    {
      value: 2,
      label: "360p",
      resolution: 360
    },
    {
      value: 3,
      label: "480p",
      resolution: 480
    },
    {
      value: 4,
      label: "720p",
      resolution: 720
    },
    {
      value: 5,
      label: "1080p",
      resolution: 1080
    },
    {
      value: 6,
      label: "1440p",
      resolution: 1440
    },
    {
      value: 7,
      label: "2160p",
      resolution: 2160
    }
  ];

  const bitrateMarks = [
    {
      value: 0,
      label: "128k",
      bitrate: 128 * 1024
    },
    {
      value: 1,
      label: "256k",
      bitrate: 256 * 1024
    },
    {
      value: 2,
      label: "512k",
      bitrate: 512 * 1024
    },
    {
      value: 3,
      label: "1M",
      bitrate: 1024 * 1024
    },
    {
      value: 4,
      label: "2.5M",
      bitrate: 2560 * 1024
    },
    {
      value: 5,
      label: "5M",
      bitrate: 5120 * 1024
    },
    {
      value: 6,
      label: "10M",
      bitrate: 10240 * 1024
    },
    {
      value: 7,
      label: "20M",
      bitrate: 20480 * 1024
    }
  ];

  const {
    resolution_control: resolutionControl,
    bitrate_control: bitrateControl,
    resolution_control_enabled: resolutionControlEnabled,
    bitrate_control_enabled: bitrateControlEnabled,
    control_by_traffic_volume: controlByTrafficVolume,
    control_by_os_quota: controlByOsQuota,
    control_by_browser_quota: controlByBrowserQuota,
    browser_quota: browserQuota,
    browser_quota_bitrate: browserQuotaBitrate
  } = settings || {};

  const [state, setState] = React.useState({
    resolution_control_enabled: false,
    bitrate_control_enabled: false,
    control_by_traffic_volume: false,
    control_by_os_quota: false,
    control_by_browser_quota: false
  });

  function onResolutionSliderChangeCommitted(event, value) {
    saveSettings(
      Object.assign(settings, {
        resolution_control: resolutionMarks[value].resolution
      })
    );
  }
  function onBitrateSliderChangeCommitted(event, value) {
    saveSettings(
      Object.assign(settings, {
        bitrate_control: bitrateMarks[value].bitrate
      })
    );
  }

  function onResolutionCheckboxChange(event) {
    setState({ ...state, resolution_control_enabled: event.target.checked });
    saveSettings(
      Object.assign(settings, {
        resolution_control_enabled: event.target.checked
      })
    );
    if (!resolutionControl)
      onResolutionSliderChangeCommitted(null, resolutionMarks.length - 1);
  }
  function onBitrateCheckboxChange(event) {
    setState({ ...state, bitrate_control_enabled: event.target.checked });
    saveSettings(
      Object.assign(settings, {
        bitrate_control_enabled: event.target.checked
      })
    );
    if (!bitrateControl)
      onBitrateSliderChangeCommitted(null, bitrateMarks.length - 1);
  }

  function onTrafficVolumeCheckboxChange(event) {
    setState({ ...state, control_by_traffic_volume: event.target.checked });
    saveSettings(
      Object.assign(settings, {
        control_by_traffic_volume: event.target.checked
      })
    );
  }
  function onOsQuotaCheckboxChange(event) {
    setState({ ...state, control_by_os_quota: event.target.checked });
    saveSettings(
      Object.assign(settings, {
        control_by_os_quota: event.target.checked
      })
    );
  }
  function onBrowserQuotaCheckboxChange(event) {
    setState({ ...state, control_by_browser_quota: event.target.checked });
    saveSettings(
      Object.assign(settings, {
        control_by_browser_quota: event.target.checked
      })
    );
  }

  function onBrowserQuotaTextFieldChange(event) {
    saveSettings(
      Object.assign(settings, {
        browser_quota: parseInt(event.target.value, 10)
      })
    );
  }
  function onBrowserQuotaBitrateTextFieldChange(event) {
    saveSettings(
      Object.assign(settings, {
        browser_quota_bitrate: parseInt(event.target.value, 10)
      })
    );
  }

  let resolutionCheckbox;
  let bitrateCheckbox;
  let resolutionSlider;
  let bitrateSlider;
  let trafficVolumeCheckbox;
  let osQuotaCheckbox;
  let browserQuotaCheckbox;
  let browserQuotaTextField;
  let browserQuotaBitrateTextField;
  if (settings !== undefined) {
    const resolutionIndex = resolutionControl
      ? resolutionMarks.filter(mark => mark.resolution <= resolutionControl)
          .length - 1
      : resolutionMarks.length - 1;
    const bitrateIndex = bitrateControl
      ? bitrateMarks.filter(mark => mark.bitrate <= bitrateControl).length - 1
      : bitrateMarks.length - 1;

    resolutionCheckbox = (
      <Checkbox
        checked={resolutionControlEnabled}
        value="resolution_control_enabled"
        onChange={onResolutionCheckboxChange}
        color="primary"
      />
    );
    bitrateCheckbox = (
      <Checkbox
        checked={bitrateControlEnabled}
        value="bitrate_control_enabled"
        onChange={onBitrateCheckboxChange}
        color="primary"
      />
    );

    resolutionSlider = (
      <Slider
        disabled={!resolutionControlEnabled}
        defaultValue={resolutionIndex}
        marks={resolutionMarks}
        step={null}
        min={0}
        max={resolutionMarks.length - 1}
        onChangeCommitted={onResolutionSliderChangeCommitted}
      />
    );
    bitrateSlider = (
      <Slider
        disabled={!bitrateControlEnabled}
        defaultValue={bitrateIndex}
        marks={bitrateMarks}
        step={null}
        min={0}
        max={bitrateMarks.length - 1}
        onChangeCommitted={onBitrateSliderChangeCommitted}
      />
    );

    trafficVolumeCheckbox = (
      <Checkbox
        checked={controlByTrafficVolume}
        value="control_by_traffic_volume"
        onChange={onTrafficVolumeCheckboxChange}
        color="primary"
      />
    );
    osQuotaCheckbox = (
      <Checkbox
        checked={controlByOsQuota}
        value="control_by_os_quota"
        onChange={onOsQuotaCheckboxChange}
        disabled={!controlByTrafficVolume}
        color="primary"
      />
    );
    browserQuotaCheckbox = (
      <Checkbox
        checked={controlByBrowserQuota}
        value="control_by_browser_quota"
        onChange={onBrowserQuotaCheckboxChange}
        disabled={!controlByTrafficVolume}
        color="primary"
      />
    );

    browserQuotaTextField = (
      <TextField
        type="number"
        inputProps={{ min: 1, style: { textAlign: "right" } }}
        defaultValue={browserQuota}
        disabled={!controlByTrafficVolume || !controlByBrowserQuota}
        onChange={onBrowserQuotaTextFieldChange}
      />
    );
    browserQuotaBitrateTextField = (
      <TextField
        type="number"
        inputProps={{ min: 1, style: { textAlign: "right" } }}
        defaultValue={browserQuotaBitrate}
        disabled={!controlByTrafficVolume}
        onChange={onBrowserQuotaBitrateTextFieldChange}
      />
    );
  }

  return (
    <Box marginY={4}>
      <Box marginY={1}>
        <Typography component="h3" variant="body1">
          ビットレート制御
        </Typography>
      </Box>
      <Paper>
        <List>
          <ListItem>
            {resolutionCheckbox}
            <ListItemText primary="動画の解像度制御を行う" />
          </ListItem>
          <ListItem className={classes.slider}>{resolutionSlider}</ListItem>
          <Divider component="li" />
          <ListItem>
            {bitrateCheckbox}
            <ListItemText primary="動画のビットレート制御を行う" />
          </ListItem>
          <ListItem className={classes.slider}>{bitrateSlider}</ListItem>
          <Divider component="li" />
          <ListItem>
            {trafficVolumeCheckbox}
            <ListItemText primary="通信量に応じて動画のビットレート制御を行う" />
          </ListItem>
          <ListItem className={classes.nested6}>
            {osQuotaCheckbox}
            <ListItemText primary="OS 全体の通信量が OS 設定の警告値を超えたら制限する" />
          </ListItem>
          <ListItem className={classes.nested6}>
            {browserQuotaCheckbox}
            <ListItemText primary="VM Browser の動画通信量が指定の値を超えたら制限する" />
          </ListItem>
          <ListItem className={classes.nested12}>
            月間
            {browserQuotaTextField}
            MB
          </ListItem>
          <ListItem className={classes.nested6}>
            <ListItemText primary="VM Browser の動画通信量が指定の値を超えたら制限する" />
          </ListItem>
          <ListItem className={classes.nested6}>
            上限
            {browserQuotaBitrateTextField}
            kbps
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};
BitrateControlSettings.propTypes = {
  settings: PropTypes.shape({}),
  saveSettings: PropTypes.instanceOf(Function)
};
BitrateControlSettings.defaultProps = {
  settings: undefined,
  saveSettings: undefined
};

const Reset = ({ settings, resetSettings }) => {
  const [dialog, openDialog] = useDialog();
  const openResetSettingsDialog = useCallback(
    () => openDialog("resetSettings", () => resetSettings()),
    [openDialog]
  );
  return (
    <Box marginY={4}>
      <Box marginY={1}>
        <Typography component="h3" variant="body1">
          設定のリセット
        </Typography>
      </Box>
      <Paper>
        {dialog}
        <List>
          <ListItem
            button
            onClick={openResetSettingsDialog}
            disabled={settings === undefined}
          >
            <ListItemText primary="初期設定に戻す" />
            <ArrowRight />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};
Reset.propTypes = {
  settings: PropTypes.shape({}),
  resetSettings: PropTypes.instanceOf(Function)
};
Reset.defaultProps = {
  settings: undefined,
  resetSettings: undefined
};

const useOverwriteSessionId = ({
  settings,
  saveSettings,
  session,
  saveSession,
  searchParam
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get(searchParam);

  if (
    session === undefined ||
    settings === undefined ||
    sessionId == null ||
    session.id === sessionId
  )
    return;

  // TODO: https://github.com/webdino/sodium/issues/233
  // NOTE: オーバーフロー無く十分に長い適当な期間
  const expiresIn = addYears(0, 10).getTime();

  saveSettings(Object.assign(settings, { expires_in: expiresIn }));
  saveSession({ id: sessionId, expires: Date.now() + expiresIn });
};

export default () => {
  const [settings, saveSettings] = useSettings();
  const [session, saveSession] = useSession();
  const resetSettings = useCallback(() => {
    saveSettings({});
    saveSession({});
    clearStatsCache();
  }, [saveSettings, saveSession]);

  useOverwriteSessionId({
    settings,
    saveSettings,
    session,
    saveSession,
    searchParam: "session_id"
  });

  return (
    <ThemeProvider>
      <Header />
      <Box paddingTop={6}>
        <Container maxWidth="sm">
          <PrivacySettings
            settings={settings}
            saveSettings={saveSettings}
            session={session}
            saveSession={saveSession}
          />
          <BitrateControlSettings
            settings={settings}
            saveSettings={saveSettings}
          />
          <Reset settings={settings} resetSettings={resetSettings} />
        </Container>
      </Box>
    </ThemeProvider>
  );
};
