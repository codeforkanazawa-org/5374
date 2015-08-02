__Translator's Note__: 5374 is the Japanese name for this webapp, which reads out as "go-mi-na-shi". This conveniently sounds like the Japanese words for "no garbage" making the name a play on words with numbers.

# Introducing 5374 to your area

If you want to launch 5374 in your region, the following documents would surely be helpful:

- [Preparing the necessary data for the 5374(gominashi).jp service launch (Japanese)](http://qiita.com/tosato3/items/e7a231e8190508e278fa)
- [Process for releasing a local 5374 app on github pages without requiring a server of your own (Japanese)](http://qiita.com/kuboon/items/1b4f64a42ce5365fb1c7)

##Subdomain Assignment

We can assign you a subdomain for your region as in the address "kanazawa.5374.jp" when you create your own 5374 app. Please contact us at the following address specifying your desired subdomain name and URL.

5374@codeforkanazawa.org



## Customizing 5374

* **Basic Customization**: You can set the basic data for your region by changing the contents of the data folder. For specific details, please see **Specifications** below.

* **Special Customization**: It may not be possible to accommodate for complicated collection days and methods depending on the local government. In that case, please refer to **Other Customization** below.

* **Design Customization**: Code for Kanazawa follows the philosophy of using beautiful design to solve problems. Since there are likely regions that differ from Kanazawa in details such as garbage categories, we have created a color scheme design guide. We would appreciate it if you referenced the included 5374colormanual.pdf when selecting your colors.


## Specifications

This section outlines the specifications for the following CSV files in the data directory.

* data/
	* area_days.csv
	* center.csv
	* description.csv
	* remarks.csv
	* target.csv


### area_days.csv

Defines the days of the week for taking out garbage in each area.  
Particularly for Kanazawa, the collection center is closed for a week in January, shifting everything by one week. For that reason the center's name is written in this document.

* **地名 (Area Name)**: The name of the area for garbage collection.

* **センター (Collection Center)**: The name of the collection center in a situation like the one for Kanazawa above. 

* **ゴミのカテゴリ (Garbage Categories)**: Three or more columns for the categories of garbage such as 燃やすごみ (burnable), 燃やさないごみ (non-burnable), 資源 (recyclable), and びん (glass bottles).

* **不定期な日付 (Irregular Dates)**: All irregular dates are defined in YYYYMMDD format, such as 20140301 or 20140325.


#### Format of Garbage Categories

Days of the week are denoted by the Japanese single character format (日:Sun, 月:M, 火:T, 水:W, 木:Th, 金:F, 土:Sat).

* Weekly collection days are denoted by the single character only.
* Multiple collection days are delimited with a single space. For example, every Monday and Thursday would be `月 木`
* A monthly collection day on the first Monday of the month would be `月1`.

#### Non-Monthly Garbage Collection

Non-monthly garbage collection can be denoted by number following a colon. For example, the second Tuesday and fourth Friday of every even-numbered month would be `火2 金4:2 4 6 8 10 12`.

※ When using this feature, please change the setting.js file below from `WeekShift = true` becomes `WeekShift = false`.

#### Special Conditions (remarks.csv)

If there are any special conditions with regards to collection days (ex. "Shibuya collection days differ for Chome 1, 2 and 3"), prepare a data/remarks.csv file and place an ID number following a `*` at the point of interest. That is, `火 木 *1` would display item with ID 1 from remarks.csv.

#### Irregular Collection Days

Irregular days are delimited with a single space as follows:

	20140301 20140325 ...

※ The format is YYYYMMDD.


### center.csv

As mentioned above, this file denotes collection centers with scheduled holidays.
If there are no such specifications, an empty file will suffice.


### description.csv

Describes each type of garbage.

* **label**: The name of each garbage type.

* **sublabel**: Currently unused.

* **description**: Currently unused.

* **styles**: Category display. Specifies an image file (SVG by default).

* **bgcolor**: Specifies the background color.


### remarks.csv

Used for adding remarks as mentioned above. If no special conditions exist, this file is not used.

Use the following syntax:

```
ID,remark
```
  
For example, the case mentioned above would be:

```
1,Shibuya collection days differ for Chome 1, 2 and 3.
```

### target.csv

Shows a list of collection days for certain garbage to be thrown out.  
The contents will be displayed on screen when its respective garbage category is tapped.

* **type**: The type value associated with the respective entry in the description.csv file.

* **name**: The name of the garbage.

* **notice**: Special considerations when throwing out this garbage.

* **furigana**: Within each list, garbage is sorted by the first letter of its name. This field indicates that letter. __Translator's Note__: Japanese written phonetically is called furigana. Using alphabetical letters rather than Japanese characters in this field should work just fine.


## Other Customization

### Scripting

The main javascript file js/script.js can be customized.

### CSS

All custom CSS should go in the custom.css file.

### Included Libraries

This application uses the following libraries and all files are included:

- [Twitter bootstrap](http://getbootstrap.com/javascript/)

- [mobile-bookmark-bubble](https://code.google.com/p/mobile-bookmark-bubble/)


### Global Constants

Global constants are set in the js/setting.js file.

* SVGLabel: `true` when SVG images are being used. ※ The Kanazawa version uses SVG files so this is `true` by default. If SVG files will not be used, set this to `false`.

* MaxDescription: Specifies the maximum number of garbage types. This does not need to be set if the maximum is less than 10.

* MaxMonth: Specifies how many months ahead to calculate.

* WeekShift: Enables a shift in the processing of weeks for cases such as the Kanazawa center above. When non-monthly collection days are specified, this should be set to `false`.