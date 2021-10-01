import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";

const Map = () => {
  const MapEl = useRef(null);

  useEffect(() => {
    loadModules([
      "esri/WebMap",
      "esri/views/MapView",
      "esri/widgets/Editor",
      "esri/widgets/Expand",
      "esri/widgets/support/SnappingControls",
    ]).then(([WebMap, MapView, Editor, Expand, SnappingControls]) => {
      let editConfigCrimeLayer, editConfigPoliceLayer;

      // Create a map from the referenced webmap item id
      let webmap = new WebMap({
        portalItem: {
          id: "154ba34201774bb29f7c3b68adf52b6a",
        },
      });

      let view = new MapView({
        container: "viewDiv",
        map: webmap,
      });

      view.when(() => {
        // Create a custom group to separate the different areas of crime.
        // This function takes a 'grouping' object containing a featuretemplate and a feature layer.

        function customGroup(grouping) {
          // If the layer is 'Police routes', do not group.
          let groupHeading = "Police Routes";
          if (grouping.layer.title.toLowerCase() === "crime map") {
            switch (grouping.template.name) {
              case "Criminal Homicide":
              case "Rape":
              case "Robbery":
              case "Aggravated Assault":
                groupHeading = "Violent Crime";
                break;
              case "Arson":
              case "Burglary":
              case "Larceny":
              case "Motor Vehicle Theft":
                groupHeading = "Property Crime";
                break;
              default:
                groupHeading = "Quality of Life";
            }
          }
          return groupHeading;
        }

        // Loop through webmap layers and set an EditConfig for each
        view.map.layers.forEach((layer) => {
          if (layer.title === "Police routes") {
            editConfigPoliceLayer = {
              layer: layer,
              // Set it so that only one field displays within the form
              fieldConfig: [
                {
                  name: "PatrolType",
                  label: "Patrol Type",
                },
              ],
            };
          } else {
            // Specify a few of the fields to edit within the form
            editConfigCrimeLayer = {
              layer: layer,
              fieldConfig: [
                {
                  name: "fulladdr",
                  label: "Full Address",
                },
                {
                  name: "neighborhood",
                  label: "Neighborhood",
                },
                {
                  name: "ucrdesc",
                  label: "UCR Description",
                },
                {
                  name: "crimecategory",
                  label: "Category",
                },
                {
                  name: "casestatus",
                  label: "Status",
                },
              ],
            };
          }
        });

        // Create the Editor
        const editor = new Editor({
          view: view,
          // Pass in the configurations created above
          layerInfos: [editConfigCrimeLayer, editConfigPoliceLayer],
          // Override the default template behavior of the Editor widget
          supportingWidgetDefaults: {
            featureTemplates: {
              groupBy: customGroup,
            },
          },

          // It is possible to set snapping via the API by directly setting SnappingOptions in the Editor. This can also be toggled on/off using the CTRL key. By default snapping is not enabled, setting enabled to true toggles this.

          snappingOptions: {
            // autocasts to SnappingOptions
            enabled: true, // sets the global snapping option that controls both geometry constraints (self-snapping) and feature snapping.
            featureSources: [
              // Autocastable to FeatureSnappingLayerSource
              // Enable feature snapping on specified layer(s)
              { layer: editConfigCrimeLayer.layer },
              { layer: editConfigPoliceLayer.layer },
            ],
          },
        });

        // Add the SnappingControls widget to provide a UI for easy toggling of Editor snapping. Associate the SnappingControls widget to the Editor's snappingOptions as seen below. If nothing is set within the Editor, the defaults will display and all layers associated with the map that support snapping display within the snapping layers as disabled.

        const snappingControls = new SnappingControls({
          label: "Configure snapping options",
          view: view,
          snappingOptions: editor.snappingOptions, // Autocastable to SnappingOptions
        });

        // Create the Expand widget and set its content to that of the SnappingControls
        const snappingExpand = new Expand({
          expandIconClass: "esri-icon-settings2",
          expandTooltip: "Show snapping UI",
          expanded: false,
          view: view,
          content: snappingControls,
        });

        // Add widgets to top and bottom right of the view
        view.ui.add(editor, "top-right");
        view.ui.add(snappingExpand, "bottom-right");
      });
    });
  });

  return (
    <>
      <div
        id="viewDiv"
        style={{ height: "100vh", width: "100vw" }}
        ref={MapEl}
      ></div>
      <div id="editorDiv"></div>
    </>
  );
};

export default Map;
