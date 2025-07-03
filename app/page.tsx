"use client";
import React, { useEffect } from "react";
import Feed from "@components/shared/Feed";
import { FilterKeys, useStore } from "@stores/index";
import { observer } from "mobx-react-lite";

const Home = () => {  
  return <Feed title="Popular Posts" filterKey={FilterKeys.Normal} />;
};

export default observer(Home);
