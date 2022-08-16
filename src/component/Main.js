import React, { useEffect, useState } from 'react';
import Trip from './Trip';
import '../css/main.css';
import Slider from '@mui/material/Slider';
import Splash from './Splash'

const axios = require('axios');

const getData = (time) => {
  const res = axios.get(`https://raw.githubusercontent.com/HNU209/Seoul-visualization/main/src/data/trips_${time}.json`);
  const result = res.then(r => r.data);
  return result
}

export default function Main() {
  const minTime = 1320;
  const maxTime = 1439;
  const [time, setTime] = useState(minTime);
  const [reset, setReset] = useState(true);
  const [trip, setTrip] = useState();
  const [loaded, setLoaded] = useState(false);
  
  const [dataTime, setDataTime] = useState([]);
  const [dataList, setDataList] = useState([]);

  const init = async () => {
    const dataArr = [];
    const dataTimeArr = [];
    for (let time = minTime; time < minTime+3; time++) {
      const returnData = await getData(time);
      if (returnData) {
        dataArr.push(...returnData);
        dataTimeArr.push(time);
      }
    }

    setDataList(dataArr);
    setDataTime(dataTimeArr);
  };

  useEffect(() => {
    init();
    setReset(false);
    setLoaded(true);
  }, [])

  useEffect(() => {
    if (reset) {
      init();
      setReset(false);
    }

    const set = new Set(dataTime);
    setDataTime([...set]);

    // console.log(dataTime)

    const t = Math.floor(time);
    if (!(dataTime.includes(t))) {
      setDataTime([...dataTime, t])
      const addData = async () => {
        const returnData = await getData(t);
        if (returnData) {
          setDataList([...dataList, ...returnData])

        }
      }
      addData(t);
    }

    const arr = [];
    for (let i = 0; i < dataList.length; i++) {
      const v = dataList[i];
      const s_t = v.timestamps[0];
      const e_t = v.timestamps[v.timestamps.length - 1];
      if ((s_t <= time) && (e_t) >= time) {
        arr.push(v);
      }
    }
    setDataList(arr);
    setTrip(arr);
  }, [time]);

  const clear = async time => {
    setDataList([]);
    setDataTime([]);

    const dataArr = [];
    const dataTimeArr = [];
    for (let t = time; t < time+3; t++) {
      if (time <= maxTime) {
        const returnData = await getData(t);
        if (returnData) {
          dataArr.push(...returnData);
          dataTimeArr.push(t);
        };
      };
    };

    setDataList(dataArr);
    setDataTime(dataTimeArr);
  };

  const SliderChange = value => {
    const time = value.target.value;
    clear(time);
    setTime(time);
  };

  return (
    <div className="container">
      {loaded ? 
      <>
        <Trip trip={trip} minTime={minTime} maxTime={maxTime} time={time} setTime={setTime} setReset={setReset}></Trip>
        <Slider id="slider" value={time} min={minTime} max={maxTime} onChange={SliderChange} track="inverted"/>
      </>
      :
      <Splash></Splash>
      }
    </div>
  );
}