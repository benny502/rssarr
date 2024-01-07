import React from "react";
import { Resource } from "react-admin";
import { PatternCreate, PatternEdit } from "./Edit.jsx";
import PatternList from "./List.jsx";

const patternResource = (
  <Resource
    name="patterns"
    list={PatternList}
    edit={PatternEdit}
    create={PatternCreate}
  />
);

export default patternResource;
