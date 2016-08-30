# webgme-gridlabd

Metamodel, visualization, and model generators for gridlab-d in
WebGME.

## Using webgme-gridlabd

### WebGME interface

The webgme interface allows the visual creation and editing of models,
where the top level (ROOT) of the webgme interface can contain models,
and each model represents a GLM (gridlabd model).

![Root view showing models and language.](./images/models.png)

### META

The meta for webgme-gridlabd is broken up into many parts, with the
base meta (GridlabD) being the only hand-crafted part of the meta. The
base meta defines what a model is, what it can contain such as
objects, globals, variables, modules, classes, etc. The types defined
in this aspect are the most basic class definitions from which all
other gridlabd types derive (e.g. a node derives from a powerflow
object which derives from object).

![Base meta defining the base types from which all gridlabd objects inheirit.](./images/baseMeta.png)

The specific metas for each of the different gridlab-d modules are
defined in their own separate sheets, which are automatically created
when running the UpdateGLDMeta plugin (described below). An example of
an imported meta can be found below (note that when it is imported it
is not automatically laid out, so some manual layout of the objects
may be necessary to better visualize the meta).

![Example imported powerflow meta.](./images/powerflowMeta.png)

### Models

Within a model, you have the ability to create nodes, links between
nodes (e.g. overhead lines, transformers), schedules, loads, etc. just
as you would in a gridlab-d model. Any connection objects between
nodes are visualized as lines connecting those nodes.

Below is a simple 4 node powerflow model which was automatically
imported from a gridlab-d model (GLM) file that exists in the gridlabd
repository.

![Simple 4 node powerflow model.](./images/simpleModel.png)

Below is a more complex example showing two communities of houses
connected to two generators. Each house has water heaters, HVAC
systems, and controllers.

![More complex Two Community model.](./images/simpleModel.png)

### ImportGLM Plugin

### GenerateGLM Plugin

### SimulateWithGridlabD Plugin

### SimulateTES Plugin

### SimulateTESCluster Plugin

### UpdateGLDMeta Plugin
