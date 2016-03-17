angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("app/accelerometer/accelerometer.html","<ion-view view-title=\"Accelerometer\">\n  <ion-content padding=\"true\" scroll=\"false\">\n    <p ng-show=\"collision.direction == \'forward\'\" style=\"font-size: 50px;\"><i class=\"ion-arrow-up-a balanced\"></i></p>\n    <p ng-show=\"collision.direction == \'stop\'\" style=\"font-size: 50px;\"><i class=\"ion-stop assertive\"></i></p>\n    <p ng-show=\"collision.direction == \'back\'\" style=\"font-size: 50px;\"><i class=\"ion-arrow-down-a balanced\"></i></p>\n    <p>Last Collision Force: {{collision.force | number: 5}}</p>\n    <div class=\"row\">\n      <div class=\"col\">\n        <button class=\"button button-outline icon-left ion-chevron-up\" ng-click=\"retractKickstands()\">Retract kickstands</button>\n        <button class=\"button button-outline icon-left ion-chevron-down\" ng-click=\"deployKickstands()\">Deploy kickstands</button>\n\n        <button class=\"button icon ion-chevron-up\" style=\"display: block; padding: 40px 60px; margin: 10px;\" ng-click=\"drive(-0.5, 0.0, 100)\"></button>\n        <button class=\"button icon ion-stop\" style=\"display: block; padding: 40px 61px; margin: 10px;\" ng-click=\"stop()\"></button>\n        <button class=\"button icon ion-chevron-down\" style=\"display: block; padding: 40px 60px; margin: 10px;\" ng-click=\"drive(0.5, 0.0, 100)\"></button>\n\n        <button class=\"button icon ion-refresh\" style=\"display: block; padding: 40px 60px; margin: 10px; margin-top: 50px;\" ng-click=\"turnByDegrees(180)\"></button>\n      </div>\n      <div class=\"col\">\n        <div class=\"list\">\n          <div class=\"item item-divider\">Minimum skub: {{collisionSettings.minAcceleration | number: 1}}</div>\n          <div class=\"item\">\n            <div class=\"range\">\n              <i class=\"icon ion-android-hand balanced\"></i>\n              <input type=\"range\" name=\"minAcceleration\" ng-model=\"collisionSettings.minAcceleration\" min=\"1\" max=\"10\" step=\"0.5\">\n              <i class=\"icon ion-android-hand assertive\"></i>\n            </div>\n          </div>\n\n          <div class=\"item item-divider\">\n            Settings\n          </div>\n\n          <ion-toggle ng-model=\"collisionSettings.detectCollisions\"\n                      ng-change=\"detectCollisionsChange()\">\n            Registrer skub\n          </ion-toggle>\n        </div>\n        <button class=\"button button-outline icon-left ion-upload\" ng-click=\"uploadData()\">Upload Data</button>\n        <p>Acceleration.X: {{acceleration.x}}</p>\n        <p>Acceleration.Y: {{acceleration.y}}</p>\n        <p>Acceleration.Z: {{acceleration.z}}</p>\n        <p>UserAcceleration.X: {{userAcceleration.x}}</p>\n        <p>UserAcceleration.Y: {{userAcceleration.y}}</p>\n        <p>UserAcceleration.Z: {{userAcceleration.z}}</p>\n        <p>Collsion Direction: {{collision.direction}}</p>\n      </div>\n    </div>\n  </ion-content>\n</ion-view>\n");
$templateCache.put("app/dashboard/dashboard.html","<ion-view view-title=\"Dashboard\">\n    <ion-content padding=\"true\" scroll=\"false\">\n        <h3 style=\"text-align: center\">Velkommen til Rogamo Trainer <i class=\"icon ion-happy-outline\"></i></h3>\n        <a class=\"button button-large button-block icon icon-right ion-chevron-right\" href=\"#/tab/eggthrow\">Kaste æg</a>\n        <a class=\"button button-large button-block icon icon-right ion-chevron-right\" href=\"#/tab/swing\">Gyngespil</a>\n    </ion-content>\n</ion-view>\n");
$templateCache.put("app/robot-controls/robot-controls.html","<ion-view view-title=\"Controls\">\n    <ion-content padding=\"true\" scroll=\"false\">\n        <div class=\"kickstand-pole-controls\">\n            <button class=\"button button-outline icon-left ion-chevron-up\" style=\"display: block; margin-bottom: 10px; width: 190px;\" ng-click=\"retractKickstands()\">Retract kickstands</button>\n            <button class=\"button button-outline icon-left ion-chevron-down\" style=\"display: block; margin-bottom: 50px; width: 190px;\" ng-click=\"deployKickstands()\">Deploy kickstands</button>\n            <button class=\"button button-outline icon-left ion-arrow-up-a\" style=\"display: block; margin-bottom: 10px; width: 190px;\" ng-click=\"poleUp()\">Pole up</button>\n            <button class=\"button button-outline icon-left ion-stop\" style=\"display: block; margin-bottom: 10px; width: 190px;\" ng-click=\"poleStop()\">Pole stop</button>\n            <button class=\"button button-outline icon-left ion-arrow-down-a\" style=\"display: block; margin-bottom: 10px; width: 190px;\" ng-click=\"poleDown()\">Pole down</button>\n        </div>\n        <div class=\"drive-controls\">\n            <div class=\"row\">\n                <div class=\"col\">\n                    <button class=\"button icon button-huge ion-chevron-left rotate-45\" on-touch=\"drive(-model.speed, -0.5)\" on-release=\"stop()\"></button>\n                </div>\n                <div class=\"col\">\n                    <button class=\"button icon button-huge ion-chevron-up\" on-touch=\"drive(-model.speed)\" on-release=\"stop()\"></button>\n                </div>\n                <div class=\"col\">\n                    <button class=\"button icon button-huge ion-chevron-up rotate-45\" on-touch=\"drive(-model.speed, 0.5)\" on-release=\"stop()\"></button>\n                </div>\n            </div>\n            <div class=\"row\">\n                <div class=\"col\">\n                    <button class=\"button icon button-huge ion-chevron-left\" on-touch=\"drive(0, 1)\" on-release=\"stop()\"></button>\n                </div>\n                <div class=\"col\">\n                    <button class=\"button icon button-huge ion-stop\" on-touch=\"stop()\"></button>\n                </div>\n                <div class=\"col\">\n                    <button class=\"button icon button-huge ion-chevron-right\" on-touch=\"drive(0, -1)\" on-release=\"stop()\"></button>\n                </div>\n            </div>\n            <div class=\"row\">\n                <div class=\"col\">\n                    <button class=\"button icon button-huge ion-chevron-down rotate-45\" on-touch=\"drive(model.speed, 0.5)\" on-release=\"stop()\"></button>\n                </div>\n                <div class=\"col\">\n                    <button class=\"button icon button-huge ion-chevron-down\" on-touch=\"drive(model.speed)\" on-release=\"stop()\"></button>\n                </div>\n                <div class=\"col\">\n                    <button class=\"button icon button-huge ion-chevron-right rotate-45\" on-touch=\"drive(model.speed, -0.5)\" on-release=\"stop()\"></button>\n                </div>\n            </div>\n            <div class=\"row\" style=\"margin-top: 20px;\">\n                <div class=\"col\">\n                    <button class=\"button icon button-huge ion-refresh\" ng-click=\"turnByDegrees(-178)\"></button>\n                </div>\n                <div class=\"col\">\n                    <button class=\"button icon button-huge ion-refresh flip-x\" ng-click=\"turnByDegrees(178)\"></button>\n                </div>\n                <div class=\"col col-bottom\">\n                    <input type=\"number\" class=\"balanced\" ng-model=\"model.degrees\" placeholder=\"indtast grader, fx 45\" style=\"text-align: center;\" />\n                    <button class=\"button icon ion-refresh flip-x\" style=\"height: 90px;\" ng-click=\"turnByDegrees(model.degrees)\" ng-disabled=\"(!model.degrees)\"> <i class=\"icon ion-refresh\"></i></button>\n                </div>\n            </div>\n            <div class=\"row\">\n                <div class=\"col col-center col-80\">\n                    <div class=\"range\">\n                        <i class=\"icon ion-ios-speedometer-outline balanced\"></i>\n                        <input type=\"range\" name=\"speed\" ng-model=\"model.speed\" min=\"0\" max=\"1\" step=\"0.1\">\n                        <i class=\"icon ion-ios-speedometer assertive\"></i>\n                    </div>\n                </div>\n                <div class=\"col col-center\">\n                    <span ng-bind=\"\'Fart: \' + (model.speed * 100)\"></span>\n                </div>\n            </div>\n            <div class=\"row\">\n                <div class=\"col\">\n                    <button class=\"button\" ng-click=\"drive(model.speed, 0.0, 100)\">1m</button>\n                </div>\n                <div class=\"col\">\n                    <button class=\"button\" ng-click=\"drive(model.speed, 0.0, 200)\">2m</button>\n                </div>\n                <div class=\"col\">\n                    <button class=\"button\" ng-click=\"drive(model.speed, 0.0, 300)\">3m</button>\n                </div>\n            </div>\n        </div>\n        <div class=\"bar bar-footer infobar\">\n            <div class=\"title\">\n                <!--<span ng-bind=\"\'DR serial: {0} | speed: {1} | message: {2}\' | format: doubleRobotics.serial:model.speed:doubleRobotics.message\"></span>-->\n                DR serial: {{doubleRobotics.serial}} | speed: {{model.speed}} | message: {{doubleRobotics.message}}\n            </div>\n        </div>\n</ion-content>\n</ion-view>\n");
$templateCache.put("app/layout/tabs.html","<!--\nCreate tabs with an icon and label, using the tabs-stable style.\nEach tab\'s child <ion-nav-view> directive will have its own\nnavigation history that also transitions its views in and out.\n-->\n<ion-tabs class=\"tabs-icon-top tabs-stable\">\n\n    <!-- Dashboard Tab -->\n    <ion-tab title=\"Spil\" icon=\"ion-ios-settings-strong\" href=\"#/tab/dash\">\n        <ion-nav-view name=\"tab-dash\"></ion-nav-view>\n    </ion-tab>\n\n    <!-- Accelerometer Tab -->\n    <ion-tab title=\"Accelerometer\" icon=\"ion-speedometer\" href=\"#/tab/acc\">\n        <ion-nav-view name=\"tab-acc\"></ion-nav-view>\n    </ion-tab>\n\n    <!-- Robot Controls Tab -->\n    <ion-tab title=\"Robot Controls\" icon=\"ion-arrow-move\" href=\"#/tab/controls\">\n        <ion-nav-view name=\"tab-controls\"></ion-nav-view>\n    </ion-tab>\n\n</ion-tabs>\n");
$templateCache.put("app/games/egg-throw.html","<ion-view view-title=\"Kaste æg\">\n    <ion-content padding=\"true\" scroll=\"false\">\n        <div class=\"list card\">\n            <div class=\"item item-divider\">Fart: {{model.speed * 100}}</div>\n            <div class=\"item item-body\">\n                <div>\n                    <div class=\"range\">\n                        <i class=\"icon ion-ios-speedometer-outline balanced\"></i>\n                        <input type=\"range\" name=\"speed\" ng-model=\"model.speed\" min=\"0\" max=\"1\" step=\"0.1\">\n                        <i class=\"icon ion-ios-speedometer assertive\"></i>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class=\"list card\">\n            <div class=\"item item-divider\">Vinkel: {{model.degrees}}</div>\n            <div class=\"item item-body\">\n                <div>\n                    <div class=\"range\">\n                        <i class=\"icon ion-ios-timer-outline balanced\"></i>\n                        <input type=\"range\" name=\"turnDegrees\" ng-model=\"model.degrees\" min=\"0\" max=\"90\" step=\"15\">\n                        <i class=\"icon ion-ios-timer assertive\"></i>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class=\"list card\">\n            <div class=\"item item-divider\">Spilleområde: {{model.range}}m</div>\n            <div class=\"item item-body\">\n                <div>\n                    <div class=\"range\">\n                        1m\n                        <input type=\"range\" name=\"range\" ng-model=\"model.range\" min=\"1\" max=\"3\" step=\"0.2\">\n                        3m\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class=\"list card\">\n            <div class=\"item item-divider\">Minimum skub: {{model.minAcceleration}} | Maksimum skub: {{model.maxAcceleration}}</div>\n            <div class=\"item item-body\">\n                <div>\n                    <div class=\"range\">\n                        <i class=\"icon ion-android-hand balanced\"></i>\n                        <input type=\"range\" name=\"minAcceleration\" ng-model=\"model.minAcceleration\" min=\"1\" max=\"2.9\" step=\"0.1\">\n                        <input type=\"range\" name=\"maxAcceleration\" ng-model=\"model.maxAcceleration\" min=\"4\" max=\"8\" step=\"0.1\">\n                        <i class=\"icon ion-android-hand assertive\"></i>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div style=\"text-align: center\"><button class=\"button button-huge icon ion-play\" ng-click=\"startGame(games.eggThrow)\"></button></div>\n        <div class=\"bar bar-footer infobar\">\n            <div class=\"title\">\n                <!--<span ng-bind=\"\'DR serial: {0} | speed: {1} | message: {2}\' | format: doubleRobotics.serial:model.speed:doubleRobotics.message\"></span>-->\n                <i ng-class=\"{\'icon ion-stop\': model.robotDriving === false, \'icon ion-play\': model.robotDriving === true}\"></i>\n                <!--DR serial: {{model.robotData.serial}} | speed: {{model.speed}} | left: {{model.robotData.leftEncoderDeltaCm}}cm | right: {{model.robotData.rightEncoderDeltaCm}}cm | message: {{model.robotData.message}}-->\n                Skub: {{acceleration.z}}\n            </div>\n        </div>\n        <div id=\"gameContainer\" ng-show=\"model.gameStarted === true\" class=\"ng-hide fade\" style=\"position: absolute; left: 0; top: 0; right: 0; bottom: 44px; background-color: rgb(185, 175, 157); z-index: 99; text-align: center\">\n            <canvas id=\"canvas\" style=\"position: absolute; left: 190px; top: 200px; border: 0px solid blue;\" width=\"400\" height=\"400\"></canvas>\n            <img src=\"img/egg_PNG5.png\" style=\"width: 600px;\" ng-hide=\"model.gameLost === true\" />\n            <img src=\"img/cracked-brown-egg.jpg\" style=\"width: 600px; margin-top: 100px;\" ng-show=\"model.gameLost === true\" />\n            <div style=\"text-align: center; position: absolute; bottom: 20px; width: 100%;\"><button class=\"button button-huge icon ion-stop\" ng-click=\"stopGame()\"></button></div>\n        </div>\n    </ion-content>\n</ion-view>\n");
$templateCache.put("app/games/swing.html","<ion-view view-title=\"Gyngespil\">\n    <ion-content padding=\"true\" scroll=\"false\">\n        <div class=\"list card\">\n            <div class=\"item item-divider\">Fart: {{(model.speed * model.lowSpeedFactor * 100).toFixed(1)}} / {{(model.speed * model.mediumSpeedFactor * 100).toFixed(1)}} / {{model.speed * 100}}</div>\n            <div class=\"item item-body\">\n                <div>\n                    <div class=\"range\">\n                        <i class=\"icon ion-ios-speedometer-outline balanced\"></i>\n                        <input type=\"range\" name=\"speed\" ng-model=\"model.speed\" min=\"0\" max=\"1\" step=\"0.1\">\n                        <i class=\"icon ion-ios-speedometer assertive\"></i>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class=\"list card\">\n            <div class=\"item item-divider\">Blødt skub: {{model.lowSpeedFactor}} | Mellem skub: {{model.mediumSpeedFactor}}</div>\n            <div class=\"item item-body\">\n                <div>\n                    <div class=\"range\">\n                        <i class=\"icon ion-android-hand balanced\"></i>\n                        <input type=\"range\" name=\"lowSpeedFactor\" ng-model=\"model.lowSpeedFactor\" min=\"0.1\" max=\"0.8\" step=\"0.05\">\n                        <input type=\"range\" name=\"mediumSpeedFactor\" ng-model=\"model.mediumSpeedFactor\" min=\"0.5\" max=\"0.9\" step=\"0.05\">\n                        <i class=\"icon ion-android-hand energized\"></i>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <!--<div class=\"list card\">\n            <div class=\"item item-divider\">Vinkel: {{model.degrees}}</div>\n            <div class=\"item item-body\">\n                <div>\n                    <div class=\"range\">\n                        <i class=\"icon ion-ios-timer-outline balanced\"></i>\n                        <input type=\"range\" name=\"turnDegrees\" ng-model=\"model.degrees\" min=\"0\" max=\"90\" step=\"15\">\n                        <i class=\"icon ion-ios-timer assertive\"></i>\n                    </div>\n                </div>\n            </div>\n        </div>-->\n        <!--<div class=\"list card\">\n            <div class=\"item item-divider\">Spilleområde: {{model.range - model.rangeLowDelta}}m / {{model.range - model.rangeMediumDelta}}m / {{model.range}}m</div>\n            <div class=\"item item-body\">\n                <div>\n                    <div class=\"range\">\n                        2m\n                        <input type=\"range\" name=\"range\" ng-model=\"model.range\" min=\"2\" max=\"4\" step=\"0.5\">\n                        4m\n                    </div>\n                </div>\n            </div>\n        </div>-->\n        <div class=\"list card\">\n            <div class=\"item item-divider\">Tid - gynge: {{model.swingduration}} sekunder</div>\n            <div class=\"item item-body\">\n                <div>\n                    <div class=\"range\">\n                        2s\n                        <input type=\"range\" name=\"swingduration\" ng-model=\"model.swingduration\" min=\"2\" max=\"6\" step=\"0.5\">\n                        6s\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class=\"list card\">\n            <div class=\"item item-divider\">Pause - gynge tilbage: {{model.swingbackpause}} sekunder</div>\n            <div class=\"item item-body\">\n                <div>\n                    <div class=\"range\">\n                        0s\n                        <input type=\"range\" name=\"swingbackpause\" ng-model=\"model.swingbackpause\" min=\"0\" max=\"2\" step=\"0.2\">\n                        2s\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class=\"list card\">\n            <div class=\"item item-divider\">Antal spillere: {{model.numberOfPlayers}}</div>\n            <div class=\"item item-body\">\n                <div>\n                    <div class=\"range\">\n                        1\n                        <input type=\"range\" name=\"numberOfPlayers\" ng-model=\"model.numberOfPlayers\" min=\"1\" max=\"4\" step=\"1\">\n                        4\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div style=\"text-align: center\"><button class=\"button button-huge icon ion-play\" ng-click=\"startGame(games.swing)\"></button></div>\n        <div class=\"bar bar-footer infobar\">\n            <div class=\"title\">\n                <!--<span ng-bind=\"\'DR serial: {0} | speed: {1} | message: {2}\' | format: doubleRobotics.serial:model.speed:doubleRobotics.message\"></span>-->\n                <i ng-class=\"{\'icon ion-stop\': model.robotDriving === false, \'icon ion-play\': model.robotDriving === true}\"></i>\n                Skub: {{force}} | speed: {{model.currentSpeed}} | left: {{model.robotData.leftEncoderDeltaCm}}cm | right: {{model.robotData.rightEncoderDeltaCm}}cm\n            </div>\n        </div>\n        <div id=\"gameContainer\" ng-show=\"model.gameStarted === true\" class=\"ng-hide fade\" style=\"position: absolute; left: 0; top: 0; right: 0; bottom: 44px; background-color: rgb(255, 255, 255); z-index: 99; text-align: center\">\n            <canvas id=\"canvas\" style=\"position: absolute; left: 190px; top: 200px; border: 0px solid blue;\" width=\"400\" height=\"400\"></canvas>\n            <a class=\"button button-block push-hard button-assertive\" style=\"height: 280px; margin: 0 20px;\" on-touch=\"push(\'hard\')\"></a>\n            <a class=\"button button-block push-medium button-energized\" style=\"height: 280px; margin: 0 20px;\" on-touch=\"push(\'medium\')\"></a>\n            <a class=\"button button-block push-soft button-calm\" style=\"height: 280px; margin: 0 20px;\" on-touch=\"push(\'soft\')\"></a>\n            <img src=\"img/pige_paa_gynge_fritlagt.png\" style=\"width: 600px; position: absolute; top: -160px; left: 100px; pointer-events: none;\" ng-hide=\"model.gameLost === true\" />\n            <div style=\"text-align: right; position: absolute; bottom: 20px; width: 100%; padding-right: 20px;\"><button class=\"button button-huge icon ion-stop\" on-touch=\"stopGame()\"></button></div>\n        </div>\n    </ion-content>\n</ion-view>\n");}]);