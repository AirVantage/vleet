Vleet
============
> Virtual fLeet of system simulator for AirVantage platform

## Usage

### Installation
Install vleet globally with `npm i -g vleet` or `yarn global add vleet`

### Set up your simulation
Create a folder to store your simulation(s) configuration files

#### Simulation description
Have a look at [simulations/trucks.json.template](simulations/trucks.json.template) file to create your own.

Let's say you want to simulate an alarm system, create a `alarmSystem.json` file in [simulations](simulations) folder. The name of the file will be used to reference your simulation.

#### Final setup
1. Create a `setup.json` out of the [setup.json.template](setup.json.template) file.
2. Provide the name of the simulation you want to run (name of the one you created in [simulations](simulations))
3. Select the AirVantage DataCenter you target: `eu` or `na`
4. Provide your (or a technical user) credentials on the selected AirVantage DataCenter.

### Launch the simulation
From the root folder just launch `vleet`

## CLI 
```console
$ vleet --help

Usage: vleet [options] <your-setup.json> (default: setup.json)

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -c, --clean    Clean the simulated resources (Systems, Gateways, Applications with the "simulationLabel")
```

## Simulation descriptor file
This JSON file (no comments allowed) is used to describe:
- Your fleet
-  The data to simulate
-  How to simulate those data

This file is divided is multiple blocks. A full example is available as a template: [simulations/trucks.json.template](simulations/trucks.json.template)

### header
>General parameters

- `name`
- `simulationLabel`: Will be added to all the resources that will be created on AirVantage (System, Gateway, Application). 
    - :warning: Will be used by `clean`  command to delete all the simulated resources.
- `labels`(optional): By default each resource is created with the `simulationLabel` but sometimes you may need to add more than one label. You can provide an array of labels to add. 
    + :warning: For the moment you have to include the `simulationLabel` in that list.

### fleet
>Fleet description

- `size`: number of systems that will be created
- `template`: description of the systems
    + `namePrefix`: Each system will have a name like `${namePrefix}${rank}`, e.g. `VTruck #1`
    + `systemType` (optional): randomly picked for each system, will be used to retrieve a reference firmware if any. Otherwise, pick one from the "firmware" list if any
        *  Array of strings, e.g `["AR7552", "AR6220"]`
    + `firmware` (optional): if no reference firmware has been found pick one from this list
        * Array of string matching application UID, e.g. `["524f332fc46c46b2b92a8cd60acc7156", "6bd26c89baad4deb963b2ac2cc220e1a"]`
    + `subscription` (optional): randomly picked for each system subscriptions
        * e.g `{ "operators": ["ATT", "Bouygues"] }`
        * :bulb: to see the entire list of supported operators, just check https://eu.airvantage.net/api/v1/operators

### generation
> The simulation behavior

- `mode`: One mode available for the moment `backToTheFuture` :sweat_smile:
    + Go back back in time up to the specified `nbDaysInPast` and generate `valuesPerDay`
- `backToTheFuture`: set up the generation mode
    + `nbDaysInPast`
    + `valuesPerDay`
- `data`: define how your systems data should be generated
    + Map of map with the data path as key and the following parameters as value
        * `generator`: use to generate the data value
            - One of the available generators or custom ones you can develop
        * `options`: map of options that will be provided to the generator

### application (optional)
> Provide more info about the data you will simulate by describing an AirVantage application

- `name`: name of the application that will be created on AirVantage
- `data`
    + Array of data description, with the following parameters
        * `id`
        * `label`: Will be displayed in AirVantage, instead of the identifier
        * `description`: Will be displayed in AirVantage
        * `elementType`: Just set it to `variable` for now :sweat_smile:
        * `type`: double (64bits float), int (32bits signed integer), string (UTF-8 text), boolean, binary and date

## Built-in generators
### Static value
> Nothing fancy here, simply "generate" the given value

```json
{
    "generator": "staticValue",
    "options": {
        "value": 42
    }
}
```

### Random
#### Random String
> By default it will return a string with random length of 5-20 characters and will contain any of the following characters. `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()[]`

```json
{
    "generator": "randomString",
    "options": {
        "pool": "abcde",
        "length": 13
    }
}
```

#### Random Integer
```json
{
    "generator": "randomInteger",
    "options": {
        "min": -3,
        "max": 4567
    }
}
```

#### Random Float
> By default it will return a fixed number of at most 4 digits after the decimal.

```json
{
    "generator": "randomFloat",
    "options": {
        "min": -3.456,
        "max": 234.324,
        "fixed": 3
    }
}
```

#### Random Boolean
> The default likelihood of success (returning true) is 50%. Can optionally specify the likelihood in percent:

```json
{
    "generator": "randomBoolean",
    "options": {
        "likelihood": 30 
    }
}
```

### Increment
> Positive or negative incremental generator for both integer and float data
> 
> **Defaults**
> * start: 0
> * step: 1
> * resetThreshold: none
> * precision: 5

```json
 {
    "generator": "incremental",
    "options": {
        "start": 3,
        "step": -0.1,
        "resetThreshold": 2.0,
        "precision": 2
    }
}
```

### Latitude & longitude
> **Ranges**
> * Latitude: -90 to 90
> * Longitude: -180 to 180

```json
{
    "generator": "geoloc",
    "options": {
        "type": "latitude",
        "min": 40.470,
        "max": 40.493
    }
}
```
 
## Need a custom data generator? 
Add them in [custom-generators](custom-generators) folder which already contains some examples.

:construction: WIP
