let navigator;

function setTopLevelNavigator(navigatorRef) {
  navigator = navigatorRef;
}

function navigate(routeName, params) {
  navigator.navigate(routeName, params);
}

function goBack() {
  navigator.goBack();
}

function reset(routeName) {
  navigator.reset({
    index: 0,
    routes: [{name: routeName}],
  });
}

export default {
  navigate,
  goBack,
  reset,
  setTopLevelNavigator,
};
