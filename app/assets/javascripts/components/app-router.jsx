/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const React = require("react");
const App = require("./app");
const Router = require("react-router");
const {
  Handler,
  Root,
  RouteHandler,
  Route,
  DefaultRoute,
  Redirect,
  Navigation,
  Link
} = Router;

const HomePage = require("./home-page");
const Mark = require("./mark");
const Transcribe = require("./transcribe");
const Verify = require("./verify");

// TODO Group routes currently not implemented
const GroupPage = require("./group-page");
const GroupBrowser = require("./group-browser");

const Project = require("../models/project.coffee");

class AppRouter {
  constructor() {
    API.type("projects")
      .get()
      .then(result => {
        window.project = new Project(result[0]);
        return this.runRoutes(window.project);
      });
  }

  runRoutes(project) {
    let w, i;
    const routes = (
      <Route name="root" path="/" handler={App}>
        <Redirect from="_=_" to="/" />
        <Route name="home" path="/home" handler={HomePage} />
        {(() => {
          const result = [];
          for (w of Array.from(project.workflows)) {
            if (["mark", "transcribe", "verify"].includes(w.name)) {
              result.push(w);
            }
          }
          return result;
        })().map((workflow, key) => {
          const handler = eval(
            workflow.name.charAt(0).toUpperCase() + workflow.name.slice(1)
          );
          return (
            <Route
              key={key}
              path={workflow.name}
              handler={handler}
              name={workflow.name}
            />
          );
        })}
        {(() => {
          const result1 = [];
          for (i = 0; i < project.workflows.length; i++) {
            w = project.workflows[i];
            if (["mark"].includes(w.name)) {
              result1.push(w);
            }
          }
          return result1;
        })().map((workflow, key) => {
          const handler = eval(
            workflow.name.charAt(0).toUpperCase() + workflow.name.slice(1)
          );
          return (
            <Route
              key={key}
              path={workflow.name + "/:subject_set_id" + "/:subject_id"}
              handler={handler}
              name={workflow.name + "_specific_subject"}
            />
          );
        })}
        {(() => {
          const result2 = [];
          for (i = 0; i < project.workflows.length; i++) {
            w = project.workflows[i];
            if (["mark"].includes(w.name)) {
              result2.push(w);
            }
          }
          return result2;
        })().map((workflow, key) => {
          const handler = eval(
            workflow.name.charAt(0).toUpperCase() + workflow.name.slice(1)
          );
          return (
            <Route
              key={key}
              path={workflow.name + "/:subject_set_id"}
              handler={handler}
              name={workflow.name + "_specific_set"}
            />
          );
        })}
        {(() => {
          const result3 = [];
          for (i = 0; i < project.workflows.length; i++) {
            w = project.workflows[i];
            if (["transcribe", "verify"].includes(w.name)) {
              result3.push(w);
            }
          }
          return result3;
        })().map((workflow, key) => {
          const handler = eval(
            workflow.name.charAt(0).toUpperCase() + workflow.name.slice(1)
          );
          return (
            <Route
              key={key}
              path={workflow.name + "/:subject_id"}
              handler={handler}
              name={workflow.name + "_specific"}
            />
          );
        })}
        {(() => {
          const result4 = [];
          for (i = 0; i < project.workflows.length; i++) {
            w = project.workflows[i];
            if (["transcribe"].includes(w.name)) {
              result4.push(w);
            }
          }
          return result4;
        })().map((workflow, key) => {
          const handler = eval(
            workflow.name.charAt(0).toUpperCase() + workflow.name.slice(1)
          );
          return (
            <Route
              key={key}
              path={workflow.name + "/:workflow_id" + "/:parent_subject_id"}
              handler={handler}
              name={workflow.name + "_entire_page"}
            />
          );
        })}
        {// Project-configured pages:
        project.pages != null
          ? project.pages.map((page, key) => {
              return (
                <Route
                  key={key}
                  path={page.name}
                  handler={this.controllerForPage(page)}
                  name={page.name}
                />
              );
            })
          : undefined}
        <Route path="groups" handler={GroupBrowser} name="groups" />
        <Route path="groups/:group_id" handler={GroupPage} name="group_show" />
        <DefaultRoute name="home-default" handler={HomePage} />
      </Route>
    );

    return Router.run(routes, (Handler, state) =>
      React.render(<Handler />, document.body)
    );
  }

  controllerForPage(page) {
    return require('create-react-class')({
      displayName: `${page.name}Page`,

      componentWillMount() {},
      // pattern = new RegExp('^(field_guide#(.*))')
      // selectedID = pattern.match("#{window.location.hash}")
      // if selectedID
      //   $('.selected-content').removeClass("selected-content")

      //   $("div#" + selectedID).addClass("selected-content"))
      //   $("a#" + selectedID).addClass("selected-content"))

      componentDidMount() {
        const pattern = new RegExp("#/[A-z]*#(.*)");
        const selectedID = `${window.location.hash}`.match(pattern);

        if (selectedID) {
          $(".selected-content").removeClass("selected-content");

          $(`div#${selectedID[1]}`).addClass("selected-content");
          $(`a#${selectedID[1]}`).addClass("selected-content");
        }

        const elms = $(React.findDOMNode(this)).find("a.about-nav");
        elms.on("click", function(e) {
          e.preventDefault();
          $(".selected-content").removeClass("selected-content");
          $(this).addClass("selected-content");

          const divId = $(this).attr("href");
          return $(divId).addClass("selected-content");
        });

        const el = $(React.findDOMNode(this)).find("#accordion");
        return el.accordion({
          collapsible: true,
          active: false,
          heightStyle: "content"
        });
      },

      navToggle(e) {},

      render() {
        const formatted_name = page.name.replace("_", " ");
        return (
          <div className="page-content custom-page" id={`${page.name}`}>
            <h1>{formatted_name}</h1>
            <div dangerouslySetInnerHTML={{ __html: marked(page.content) }} />
            {page.group_browser != null && page.group_browser !== "" ? (
              <div className="group-area">
                <GroupBrowser project={project} title={page.group_browser} />
              </div>
            ) : (
              undefined
            )}
            <div className="updated-at">Last Update {page.updated_at}</div>
          </div>
        );
      }
    });
  }
}

module.exports = AppRouter;
window.React = React;
