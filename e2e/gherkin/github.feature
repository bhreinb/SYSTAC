@auto_regression @chrome @firefox @safari @edge @ie @chromeHeadless @firefoxHeadless @samsung @android @ipad @iphone
  Feature: github

  I want to find TestCafe repository on GitHub

  Scenario: Searching for TestCafe on GitHub
    Given The "GitHubHome" page
    When I am typing my search request "TestCafe" on GitHub
    Then I am pressing enter key on GitHub
    Then I should see that the first GitHub's result is DevExpress/testcafe

  Scenario: Try to use TestCafe Role
    Given The "GitHubHome" page nav method 2
    Then I am trying to use a Role

  Scenario: Multiple Selectors Via TestCafe
    Given The "GitHubHome" page nav method 2
    When I navigate to page "GitHubFeatures"
    Then I should see the following features
      | Code review | Project Management | Integrations | Team management | Social coding | Documentation | Code hosting |
