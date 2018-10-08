@auto_regression @chrome @firefox @safari @edge @ie @chromeHeadless @firefoxHeadless @samsung @android @ipad @iphone
Feature: google

  I want to find TestCafe repository by Google search

  Scenario: Searching for TestCafe by Google
    Given The "Google" page
    When I am typing my search request "github TestCafe" on Google
    Then I press the "enter" key on Google
    Then I should see that the first Google's result is "GitHub - DevExpress/testcafe:"

  Scenario: Failing scenario
    Given The "Google" page
    When I am typing my search request "github TestCafe" on Google
    Then I press the "enter" key on Google
    Then I should see that the first Google's result is "kittens"
