import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Viewing from "./Viewing";
import ChromeExtensionWrapper from "../utils/ChromeExtensionWrapper";
import AppData from "../utils/AppData";
import AppDataActions from "../utils/AppDataActions";
import { Services, LocationToService } from "../utils/Utils";
import RegionalAverageQoE from "../utils/RegionalAverageQoE";
import HourlyAverageQoE from "../utils/HourlyAverageQoE";
import style from "../../css/GridContainer.module.css";
import ViewingDetail from "./ViewingDetail";
import DataErase from "../utils/DataErase";

class ViewingList extends Component {
  constructor() {
    super();
    this.state = {
      viewings: [],
      sites: Object.values(Services),
      date: new Date()
    };
  }

  async componentDidMount() {
    const viewings = await new Promise(resolve => {
      ChromeExtensionWrapper.loadVideoIds(resolve);
    });
    this.setState({
      viewings: viewings
        .map(({ id, data }) => ({
          id,
          sessionId: data.session_id,
          videoId: data.video_id,
          location: data.location,
          startTime: new Date(data.start_time)
        }))
        .sort((a, b) => a.startTime - b.startTime)
    });
    const regions = viewings
      .map(({ data }) => {
        const { country, subdivision } = data.region || {};
        return { country, subdivision };
      })
      .filter(
        (region, i, self) =>
          i ===
          self.findIndex(
            r =>
              r.country === region.country &&
              r.subdivision === region.subdivision
          )
      );
    const regionalAverageQoE = new RegionalAverageQoE(regions);
    await regionalAverageQoE.init();
    this.setState({ regionalAverageQoE });
    const hourlyAverageQoE = new HourlyAverageQoE();
    await hourlyAverageQoE.init();
    this.setState({ hourlyAverageQoE });
    AppData.add(AppDataActions.ViewingList, this, "setState");
  }

  render() {
    const {
      viewings,
      sites,
      date,
      regionalAverageQoE,
      hourlyAverageQoE
    } = this.state;

    const viewingList = viewings
      .filter(({ location }) => sites.includes(LocationToService(location)))
      .filter(
        ({ startTime }) =>
          startTime.getFullYear() === date.getFullYear() &&
          startTime.getMonth() === date.getMonth()
      )
      .map(viewing =>
        Object.assign(viewing, {
          disabled: DataErase.contains(viewing.id)
        })
      )
      .map(({ id, sessionId, videoId, disabled }) => (
        <div
          className={`${style.content}`}
          role="button"
          onClick={() => {
            if (disabled) return;
            AppData.update(
              AppDataActions.Modal,
              <ViewingDetail
                key={id}
                sessionId={sessionId}
                videoId={videoId}
                regionalAverageQoE={regionalAverageQoE}
                hourlyAverageQoE={hourlyAverageQoE}
              />
            );
          }}
          onKeyPress={this.handleKeyPress}
          tabIndex="0"
        >
          <Viewing
            key={id + (disabled ? "_disabled" : "")}
            sessionId={sessionId}
            videoId={videoId}
            regionalAverageQoE={regionalAverageQoE}
            hourlyAverageQoE={hourlyAverageQoE}
            disabled={disabled}
          />
        </div>
      ));
    return (
      <div className={style.gridContainer}>
        <Grid
          container
          spacing={24}
          direction="row"
          alignItems="flex-start"
          id={style.con}
          className={viewingList.length === 0 ? "" : style.grid}
        >
          {viewingList}
        </Grid>
      </div>
    );
  }
}
export default ViewingList;
