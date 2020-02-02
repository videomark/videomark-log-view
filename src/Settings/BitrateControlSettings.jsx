import React from "react";
import PropTypes from "prop-types";
import { styled } from "@material-ui/styles";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import MuiList from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import Slider from "@material-ui/core/Slider";

const List = styled(MuiList)({
  padding: 0
});

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
    },
    browserQuotaSlider: {
      paddingLeft: theme.spacing(6),
      paddingRight: theme.spacing(4)
    },
    browserQuotaBitrateSlider: {
      paddingLeft: theme.spacing(6),
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

  const quotaMarks = [
    {
      value: 0,
      label: "1GB",
      quota: 1024
    },
    {
      value: 1,
      label: "2GB",
      quota: 2 * 1024
    },
    {
      value: 2,
      label: "3GB",
      quota: 3 * 1024
    },
    {
      value: 3,
      label: "5GB",
      quota: 5 * 1024
    },
    {
      value: 4,
      label: "7GB",
      quota: 7 * 1024
    },
    {
      value: 5,
      label: "10GB",
      quota: 10 * 1024
    },
    {
      value: 6,
      label: "20GB",
      quota: 20 * 1024
    },
    {
      value: 7,
      label: "30GB",
      quota: 30 * 1024
    }
  ];

  const {
    resolution_control: resolutionControl,
    bitrate_control: bitrateControl,
    resolution_control_enabled: resolutionControlEnabled,
    bitrate_control_enabled: bitrateControlEnabled,
    control_by_traffic_volume: controlByTrafficVolume,
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

  function onBrowserQuotaCheckboxChange(event) {
    setState({ ...state, control_by_browser_quota: event.target.checked });
    saveSettings(
      Object.assign(settings, {
        control_by_traffic_volume: event.target.checked,
        control_by_browser_quota: event.target.checked
      })
    );
  }

  function onBrowserQuotaSliderChangeCommitted(event, value) {
    saveSettings(
      Object.assign(settings, {
        browser_quota: quotaMarks[value].quota
      })
    );
  }
  function onBrowserQuotaBitrateSliderChangeCommitted(event, value) {
    saveSettings(
      Object.assign(settings, {
        browser_quota_bitrate: bitrateMarks[value].bitrate
      })
    );
  }

  let resolutionCheckbox;
  let bitrateCheckbox;
  let resolutionSlider;
  let bitrateSlider;
  let browserQuotaCheckbox;
  let browserQuotaSlider;
  let browserQuotaBitrateSlider;
  if (settings !== undefined) {
    const resolutionIndex = resolutionControl
      ? resolutionMarks.filter(mark => mark.resolution <= resolutionControl)
          .length - 1
      : resolutionMarks.length - 1;
    const bitrateIndex = bitrateControl
      ? bitrateMarks.filter(mark => mark.bitrate <= bitrateControl).length - 1
      : bitrateMarks.length - 1;
    const browserQuotaIndex = browserQuota
      ? quotaMarks.filter(mark => mark.quota <= browserQuota).length - 1
      : quotaMarks.length - 1;
    const browserQuotaBitrateIndex = browserQuotaBitrate
      ? bitrateMarks.filter(mark => mark.bitrate <= browserQuotaBitrate).length - 1
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

    browserQuotaCheckbox = (
      <Checkbox
        checked={controlByBrowserQuota}
        value="control_by_browser_quota"
        onChange={onBrowserQuotaCheckboxChange}
        color="primary"
      />
    );

    browserQuotaSlider = (
      <Slider
        disabled={!controlByTrafficVolume || !controlByBrowserQuota}
        defaultValue={browserQuotaIndex}
        marks={quotaMarks}
        step={null}
        min={0}
        max={quotaMarks.length - 1}
        onChangeCommitted={onBrowserQuotaSliderChangeCommitted}
      />
    );
    browserQuotaBitrateSlider = (
      <Slider
        disabled={!controlByTrafficVolume || !controlByBrowserQuota}
        defaultValue={browserQuotaBitrateIndex}
        marks={bitrateMarks}
        step={null}
        min={0}
        max={bitrateMarks.length - 1}
        onChangeCommitted={onBrowserQuotaBitrateSliderChangeCommitted}
      />
    );
  }

  return (
    <Box marginY={4}>
      <Box marginY={1}>
        <Typography component="h3" variant="body1">
          ビットレート制限
        </Typography>
      </Box>
      <Paper>
        <List>
          <ListItem>
            {resolutionCheckbox}
            <ListItemText primary="動画の解像度制限を行う" />
          </ListItem>
          <ListItem className={classes.slider}>{resolutionSlider}</ListItem>
          <Divider component="li" />
          <ListItem>
            {bitrateCheckbox}
            <ListItemText primary="動画のビットレート制限を行う" />
          </ListItem>
          <ListItem className={classes.slider}>{bitrateSlider}</ListItem>
          <Divider component="li" />
          <ListItem>
            {browserQuotaCheckbox}
            <ListItemText primary="月間の VM Browser の動画通信量が指定の値を超えたら制限する" />
          </ListItem>
          <ListItem className={classes.slider}>
            {browserQuotaSlider}
          </ListItem>
          <ListItem className={classes.nested6}>
            <ListItemText primary="VM Browser の動画通信量が指定の値を超えたら制限する" />
          </ListItem>
          <ListItem className={classes.browserQuotaBitrateSlider}>
            {browserQuotaBitrateSlider}
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};
BitrateControlSettings.propTypes = {
  settings: PropTypes.shape({ display_on_player: PropTypes.bool }),
  saveSettings: PropTypes.instanceOf(Function)
};
BitrateControlSettings.defaultProps = {
  settings: undefined,
  saveSettings: undefined
};
export default BitrateControlSettings;
