# functions for calculating commodity threats + levels
import json
import pandas as pd

pd.options.mode.chained_assignment = None

# indicator levels for each variable as a dictionary with the year as a key (string) and the value a list of
# [low, medium, high] cutoff breaks

# Indicator Levels for Threat Forest [low, medium, high]

# IF YOU ARE CHANGING THE YEAR, CONSIDER SYNCING WITH GFWPRO-ANALSES lambdas/post-geotrellis/utils_commodity.py


INDICATOR_LEVELS_THREAT_FOREST = {
    "2002": [0.0000, 0.0021, 0.0034],
    "2003": [0.0000, 0.0019, 0.0028],
    "2004": [0.0000, 0.0026, 0.004],
    "2005": [0.0000, 0.0036, 0.0059],
    "2006": [0.0000, 0.0038, 0.0065],
    "2007": [0.0000, 0.0038, 0.0063],
    "2008": [0.0000, 0.0032, 0.0073],
    "2009": [0.0000, 0.004, 0.0087],
    "2010": [0.0000, 0.0043, 0.0081],
    "2011": [0.0000, 0.0038, 0.0072],
    "2012": [0.0000, 0.0053, 0.0094],
    "2013": [0.0000, 0.0046, 0.0087],
    "2014": [0.0000, 0.0045, 0.008],
    "2015": [0.0000, 0.0061, 0.0102],
    "2016": [0.0000, 0.006, 0.0128],
    "2017": [0.0000, 0.0070, 0.0122],
    "2018": [0.0000, 0.0046, 0.0089],
    "2019": [0.0000, 0.0039, 0.0074],
    "2020": [0.0000, 0.0033, 0.0064],
    "2021": [0.0000, 0.0029, 0.0056],
    "2022": [0.0000, 0.0026, 0.0057],
    "2023": [0.0000, 0.0034, 0.0068],
    "2024": [0.0000, 0.0039, 0.0073],
}

# Indicator Levels for Threat Peat [low, medium, high]
INDICATOR_LEVELS_THREAT_PEAT = {
    "2002": [0.0000, 0.0194, 0.0804],
    "2003": [0.0000, 0.0192, 0.0801],
    "2004": [0.0000, 0.0194, 0.0803],
    "2005": [0.0000, 0.0195, 0.0805],
    "2006": [0.0000, 0.0194, 0.0805],
    "2007": [0.0000, 0.0194, 0.0811],
    "2008": [0.0000, 0.0193, 0.0811],
    "2009": [0.0000, 0.0193, 0.0811],
    "2010": [0.0000, 0.0194, 0.0809],
    "2011": [0.0000, 0.0194, 0.0806],
    "2012": [0.0000, 0.0194, 0.0811],
    "2013": [0.0000, 0.0915, 0.081],
    "2014": [0.0000, 0.0195, 0.0808],
    "2015": [0.0000, 0.02, 0.0811],
    "2016": [0.0000, 0.0201, 0.0817],
    "2017": [0.0000, 0.0557, 0.1316],
    "2018": [0.0000, 0.0515, 0.1263],
    "2019": [0.0000, 0.0496, 0.1251],
    "2020": [0.0000, 0.0416, 0.1121],
    "2021": [0.0000, 0.0399, 0.1079],
    "2022": [0.0000, 0.0433, 0.1148],
    "2023": [0.0000, 0.0436, 0.1133],
    "2024": [0.0000, 0.0436, 0.1141],
}

# Indicator Levels for Threat WDPA [low, medium, high]
INDICATOR_LEVELS_THREAT_WDPA = {
    "2002": [0.0000, 0.0008, 0.0055],
    "2003": [0.0000, 0.0008, 0.0054],
    "2004": [0.0000, 0.0008, 0.0054],
    "2005": [0.0000, 0.0008, 0.0056],
    "2006": [0.0000, 0.0008, 0.0056],
    "2007": [0.0000, 0.0008, 0.0058],
    "2008": [0.0000, 0.0008, 0.0056],
    "2009": [0.0000, 0.0008, 0.0055],
    "2010": [0.0000, 0.0008, 0.0057],
    "2011": [0.0000, 0.0008, 0.0055],
    "2012": [0.0000, 0.0009, 0.0056],
    "2013": [0.0000, 0.0009, 0.0055],
    "2014": [0.0000, 0.0009, 0.0055],
    "2015": [0.0000, 0.001, 0.0058],
    "2016": [0.0000, 0.0013, 0.0066],
    "2017": [0.0000, 0.0012, 0.0067],
    "2018": [0.0000, 0.0008, 0.0054],
    "2019": [0.0000, 0.0005, 0.0039],
    "2020": [0.0000, 0.0008, 0.0052],
    "2021": [0.0000, 0.0007, 0.0047],
    "2022": [0.0000, 0.0016, 0.0072],
    "2023": [0.0000, 0.0016, 0.0071],
    "2024": [0.0000, 0.0017, 0.0074],
}

# Indicator Levels for Threat Fires [low, medium, high]
INDICATOR_LEVELS_THREAT_FIRES = {
    "2002": [0.00000, 0.00022, 0.00053],
    "2003": [0.00000, 0.00035, 0.0009],
    "2004": [0.00000, 0.0004, 0.00095],
    "2005": [0.00000, 0.00049, 0.00091],
    "2006": [0.00000, 0.00046, 0.00131],
    "2007": [0.00000, 0.00036, 0.00108],
    "2008": [0.00000, 0.00025, 0.00052],
    "2009": [0.00000, 0.00034, 0.00081],
    "2010": [0.00000, 0.00031, 0.00068],
    "2011": [0.00000, 0.00021, 0.00047],
    "2012": [0.00000, 0.00027, 0.00071],
    "2013": [0.00000, 0.00025, 0.00067],
    "2014": [0.00000, 0.00034, 0.00074],
    "2015": [0.00000, 0.00039, 0.00102],
    "2016": [0.00000, 0.00028, 0.00069],
    "2017": [0.00000, 0.00011, 0.00021],
    "2018": [0.00000, 0.00010, 0.00021],
    "2019": [0.00000, 0.00019, 0.00045],
    "2020": [0.00000, 0.00016, 0.00038],
    "2021": [0.00000, 0.00006, 0.00012],
    "2022": [0.00000, 0.00005, 0.00011],
    "2023": [0.00000, 0.00009, 0.00020],
    "2024": [0.00000, 0.00012, 0.00027],
}

INDICATOR_LEVELS_VALUE_FOREST = {
    "2002": [0.0000, 0.2337, 0.3428],
    "2003": [0.0000, 0.233, 0.3418],
    "2004": [0.0000, 0.2312, 0.3403],
    "2005": [0.0000, 0.2302, 0.34],
    "2006": [0.0000, 0.229, 0.3385],
    "2007": [0.0000, 0.2273, 0.3361],
    "2008": [0.0000, 0.2246, 0.3339],
    "2009": [0.0000, 0.2216, 0.332],
    "2010": [0.0000, 0.2192, 0.3307],
    "2011": [0.0000, 0.2158, 0.3258],
    "2012": [0.0000, 0.214, 0.3242],
    "2013": [0.0000, 0.2117, 0.3205],
    "2014": [0.0000, 0.2077, 0.3167],
    "2015": [0.0000, 0.2066, 0.3149],
    "2016": [0.0000, 0.2033, 0.3097],
    "2017": [0.0000, 0.1973, 0.3241],
    "2018": [0.0000, 0.1915, 0.3168],
    "2019": [0.0000, 0.1861, 0.3153],
    "2020": [0.0000, 0.1836, 0.3119],
    "2021": [0.0000, 0.1812, 0.3125],
    "2022": [0.0000, 0.1748, 0.3061],
    "2023": [0.0000, 0.1734, 0.3055],
    "2024": [0.0000, 0.1707, 0.3034],
}

# indicator Levels for Value Peat [low, medium, high]
INDICATOR_LEVELS_VALUE_PEAT = {
    "2002": [0.0000, 0.0481, 0.1623],
    "2003": [0.0000, 0.0481, 0.1623],
    "2004": [0.0000, 0.0481, 0.1623],
    "2005": [0.0000, 0.0481, 0.1623],
    "2006": [0.0000, 0.0481, 0.1623],
    "2007": [0.0000, 0.0481, 0.1623],
    "2008": [0.0000, 0.0481, 0.1623],
    "2009": [0.0000, 0.0481, 0.1623],
    "2010": [0.0000, 0.0481, 0.1623],
    "2011": [0.0000, 0.0481, 0.1623],
    "2012": [0.0000, 0.0481, 0.1623],
    "2013": [0.0000, 0.0481, 0.1623],
    "2014": [0.0000, 0.0481, 0.1623],
    "2015": [0.0000, 0.0481, 0.1623],
    "2016": [0.0000, 0.0481, 0.1623],
    "2017": [0.0000, 0.1381, 0.2643],
    "2018": [0.0000, 0.1343, 0.2635],
    "2019": [0.0000, 0.1338, 0.2642],
    "2020": [0.0000, 0.1204, 0.2349],
    "2021": [0.0000, 0.1196, 0.2327],
    "2022": [0.0000, 0.1202, 0.2329],
    "2023": [0.0000, 0.1212, 0.2318],
    "2024": [0.0000, 0.1212, 0.2318],
}

# Indicator Levels for Value WDPA [low, medium, high]
INDICATOR_LEVELS_VALUE_WDPA = {
    "2002": [0.0000, 0.0411, 0.1127],
    "2003": [0.0000, 0.0411, 0.1127],
    "2004": [0.0000, 0.0411, 0.1127],
    "2005": [0.0000, 0.0411, 0.1127],
    "2006": [0.0000, 0.0411, 0.1127],
    "2007": [0.0000, 0.0411, 0.1127],
    "2008": [0.0000, 0.0411, 0.1127],
    "2009": [0.0000, 0.0411, 0.1127],
    "2010": [0.0000, 0.0411, 0.1127],
    "2011": [0.0000, 0.0411, 0.1127],
    "2012": [0.0000, 0.0411, 0.1127],
    "2013": [0.0000, 0.0411, 0.1127],
    "2014": [0.0000, 0.0411, 0.1127],
    "2015": [0.0000, 0.0411, 0.1127],
    "2016": [0.0000, 0.0411, 0.1127],
    "2017": [0.0000, 0.0402, 0.1103],
    "2018": [0.0000, 0.0411, 0.1109],
    "2019": [0.0000, 0.0347, 0.1053],
    "2020": [0.0000, 0.0532, 0.1330],
    "2021": [0.0000, 0.0520, 0.1326],
    "2022": [0.0000, 0.0513, 0.1324],
    "2023": [0.0000, 0.0508, 0.1317],
    "2024": [0.0000, 0.0520, 0.1337],
}

INDICATOR_LEVELS_THREAT_OVERALL = {
    "2002": [0.0000, 0.9999, 1.5999],
    "2003": [0.0000, 0.9999, 1.5999],
    "2004": [0.0000, 0.9999, 1.5999],
    "2005": [0.0000, 0.9999, 1.5999],
    "2006": [0.0000, 0.9999, 1.5999],
    "2007": [0.0000, 0.9999, 1.5999],
    "2008": [0.0000, 0.9999, 1.5999],
    "2009": [0.0000, 0.9999, 1.5999],
    "2010": [0.0000, 0.9999, 1.5999],
    "2011": [0.0000, 0.9999, 1.5999],
    "2012": [0.0000, 0.9999, 1.5999],
    "2013": [0.0000, 0.9999, 1.5999],
    "2014": [0.0000, 0.9999, 1.5999],
    "2015": [0.0000, 0.9999, 1.5999],
    "2016": [0.0000, 0.9999, 1.5999],
    "2017": [0.0000, 0.9999, 1.5999],
    "2018": [0.0000, 0.9999, 1.5999],
    "2019": [0.0000, 0.9999, 1.5999],
    "2020": [0.0000, 0.9999, 1.5999],
    "2021": [0.0000, 0.9999, 1.5999],
    "2022": [0.0000, 0.9999, 1.5999],
    "2023": [0.0000, 0.9999, 1.5999],
}

INDICATOR_LEVELS_VALUE_OVERALL = {
    "2002": [0.0000, 0.9999, 1.5999],
    "2003": [0.0000, 0.9999, 1.5999],
    "2004": [0.0000, 0.9999, 1.5999],
    "2005": [0.0000, 0.9999, 1.5999],
    "2006": [0.0000, 0.9999, 1.5999],
    "2007": [0.0000, 0.9999, 1.5999],
    "2008": [0.0000, 0.9999, 1.5999],
    "2009": [0.0000, 0.9999, 1.5999],
    "2010": [0.0000, 0.9999, 1.5999],
    "2011": [0.0000, 0.9999, 1.5999],
    "2012": [0.0000, 0.9999, 1.5999],
    "2013": [0.0000, 0.9999, 1.5999],
    "2014": [0.0000, 0.9999, 1.5999],
    "2015": [0.0000, 0.9999, 1.5999],
    "2016": [0.0000, 0.9999, 1.5999],
    "2017": [0.0000, 0.9999, 1.5999],
    "2018": [0.0000, 0.9999, 1.5999],
    "2019": [0.0000, 0.9999, 1.5999],
    "2020": [0.0000, 0.9999, 1.5999],
    "2021": [0.0000, 0.9999, 1.5999],
    "2022": [0.0000, 0.9999, 1.5999],
    "2023": [0.0000, 0.9999, 1.5999],
}

INDICATOR_LEVELS_MILL_PRIORITY = {
    "2002": [0.0000, 1.9999, 3.0999],
    "2003": [0.0000, 1.9999, 3.0999],
    "2004": [0.0000, 1.9999, 3.0999],
    "2005": [0.0000, 1.9999, 3.0999],
    "2006": [0.0000, 1.9999, 3.0999],
    "2007": [0.0000, 1.9999, 3.0999],
    "2008": [0.0000, 1.9999, 3.0999],
    "2009": [0.0000, 1.9999, 3.0999],
    "2010": [0.0000, 1.9999, 3.0999],
    "2011": [0.0000, 1.9999, 3.0999],
    "2012": [0.0000, 1.9999, 3.0999],
    "2013": [0.0000, 1.9999, 3.0999],
    "2014": [0.0000, 1.9999, 3.0999],
    "2015": [0.0000, 1.9999, 3.0999],
    "2016": [0.0000, 1.9999, 3.0999],
    "2017": [0.0000, 1.9999, 3.0999],
    "2018": [0.0000, 1.9999, 3.0999],
    "2019": [0.0000, 1.9999, 3.0999],
    "2020": [0.0000, 1.9999, 3.0999],
    "2021": [0.0000, 1.9999, 3.0999],
    "2022": [0.0000, 1.9999, 3.0999],
    "2023": [0.0000, 1.9999, 3.0999],
}


def calculateLevels(obj_year_vals, land_cover_area, obj_levels):
    """
    Function to pass in values for years with the array of levels to check against to return levels for each year.
    :param obj_year_vals: dictionary of years and their values
    :param land_cover_area: land cover total area to standardize/normalize
    :param obj_levels: the levels to compare values against
    :return: Returns a new object with the correct level identified for each year
    """

    if type(obj_year_vals) == str:
        obj_year_vals = json.loads(obj_year_vals)

    objCalculatedLevels = dict()
    # k=year, v=value
    for k, v in obj_year_vals.items():

        # obtain the value to compare
        nVal = v / land_cover_area

        # Obtain the levels for the particular property/year from the dictionary
        arrLevels = obj_levels.get(
            k, None
        )  # if the key for the year doesn't exist then skip it
        if arrLevels is not None:
            curLevel = 0
            for i in range(len(arrLevels) - 1, -1, -1):
                if nVal >= arrLevels[i]:
                    curLevel = i
                    break
            objCalculatedLevels[k] = curLevel
    return objCalculatedLevels


def applyCalcLevels(inputColumn, division, indicator_levels):
    """
    Apply calculation for levels on a pandas dataframe
    :param inputColumn: input column with yearly values as string or dict
    :param division: column or constant with the total area to standardize
    :param indicator_levels: variable indicator levels for low, medium, high breaks
    :return: yearly dictionary of the calculated levels as JSON string
    """
    if type(inputColumn) == str:
        d = json.loads(inputColumn)
    else:
        d = inputColumn

    l = calculateLevels(d, division, indicator_levels)

    # dump to JSON with double quotes
    json_string = json.dumps(l)
    return json_string


def addLevelColumns(df, total_area_column_name="total_area"):
    """
    Add all calculated levels to the dataframe as new columns
    :param df: pandas dataframe
    :param total_area_column_name: name of the column with the tota area to use to normalize
    :return: dataframe with calculated levels added
    """
    # threat levels
    df["commodity_threat_deforestation_level"] = df.apply(
        lambda x: applyCalcLevels(
            x["commodity_threat_deforestation"],
            x[total_area_column_name],
            INDICATOR_LEVELS_THREAT_FOREST,
        ),
        axis=1,
    )

    df["commodity_threat_peat_level"] = df.apply(
        lambda x: applyCalcLevels(
            x["commodity_threat_peat"],
            x[total_area_column_name],
            INDICATOR_LEVELS_THREAT_PEAT,
        ),
        axis=1,
    )

    df["commodity_threat_protected_areas_level"] = df.apply(
        lambda x: applyCalcLevels(
            x["commodity_threat_protected_areas"],
            x[total_area_column_name],
            INDICATOR_LEVELS_THREAT_WDPA,
        ),
        axis=1,
    )

    df["commodity_threat_fires_level"] = df.apply(
        lambda x: applyCalcLevels(
            x["commodity_threat_fires"],
            x[total_area_column_name],
            INDICATOR_LEVELS_THREAT_FIRES,
        ),
        axis=1,
    )

    # value levels
    df["commodity_value_forest_extent_level"] = df.apply(
        lambda x: applyCalcLevels(
            x["commodity_value_forest_extent"],
            x[total_area_column_name],
            INDICATOR_LEVELS_VALUE_FOREST,
        ),
        axis=1,
    )

    df["commodity_value_peat_level"] = df.apply(
        lambda x: applyCalcLevels(
            x["commodity_value_peat"],
            x[total_area_column_name],
            INDICATOR_LEVELS_VALUE_PEAT,
        ),
        axis=1,
    )

    df["commodity_value_protected_areas_level"] = df.apply(
        lambda x: applyCalcLevels(
            x["commodity_value_protected_areas"],
            x[total_area_column_name],
            INDICATOR_LEVELS_VALUE_WDPA,
        ),
        axis=1,
    )
    return df


def overallScores(*level_dictionaries):
    """
    calculate overall threat levels by combining scores from multiple threats

    overall threat level
    FIRST: convert each individual threat level to a score
    SECOND: sum the scores
    THIRD: convert summed score to overall level

    :param level_dictionaries: multiple dictionaries that contain the yearly threat/value levels (JSON string)
    :return: overall calculated score as a yearly dictionary
    """
    levels2score = {0: 0, 1: 0.2, 2: 1}  # low  # medium  # high

    threatOverallScores = dict()

    # loop through the dictionaries and add the value to the overall score (round to nearest decimal)
    for d in level_dictionaries:

        # convert json string to dictionary
        if type(d) == str:
            d = json.loads(d)

        # k=year, v=value
        for k, v in d.items():
            threatOverallScores[k] = round(
                threatOverallScores.get(k, 0) + levels2score[d.get(k, 0)], 1
            )

    # dump to JSON with double quotes
    json_string = json.dumps(threatOverallScores)

    return json_string


def millPriorityScores(threatOverallScores, valueOverallScores):
    """
    Add the threat overall score and value overall score together per year
    :param threatOverallScores: dictionary of overall threat scores per year
    :param valueOverallScores: dictionary of overall value scores per year
    :return: dictionary that adds the two together
    """

    if type(threatOverallScores) == str:
        threatOverallScores = json.loads(threatOverallScores)

    if type(valueOverallScores) == str:
        valueOverallScores = json.loads(valueOverallScores)

    mill_scores = {}

    years_with_scores = list(
        set(list(threatOverallScores.keys()) + list(valueOverallScores.keys()))
    )

    for year in years_with_scores:
        mill_scores[year] = round(
            threatOverallScores.get(year, 0) + valueOverallScores.get(year, 0), 1
        )

    # dump to JSON with double quotes
    mill_scores = json.dumps(mill_scores)

    return mill_scores


def addOverallScoresLevels(df):
    """
    Adds overall scores and levels to the dataframe
    :param df: pandas dataframe
    :return: dataframe with calculated overall scores and levels
    """
    df["commodity_threat_overall_score"] = df.apply(
        lambda x: overallScores(
            x["commodity_threat_deforestation_level"],
            x["commodity_threat_peat_level"],
            x["commodity_threat_protected_areas_level"],
            x["commodity_threat_fires_level"],
        ),
        axis=1,
    )

    df["commodity_value_overall_score"] = df.apply(
        lambda x: overallScores(
            x["commodity_value_forest_extent_level"],
            x["commodity_value_peat_level"],
            x["commodity_value_protected_areas_level"],
        ),
        axis=1,
    )

    df["commodity_threat_overall_level"] = df.apply(
        lambda x: applyCalcLevels(
            x["commodity_threat_overall_score"], 1, INDICATOR_LEVELS_THREAT_OVERALL
        ),
        axis=1,
    )

    df["commodity_value_overall_level"] = df.apply(
        lambda x: applyCalcLevels(
            x["commodity_value_overall_score"], 1, INDICATOR_LEVELS_VALUE_OVERALL
        ),
        axis=1,
    )

    df["commodity_mill_priority_score"] = df.apply(
        lambda x: millPriorityScores(
            x["commodity_threat_overall_score"], x["commodity_value_overall_score"]
        ),
        axis=1,
    )

    df["commodity_mill_priority_level"] = df.apply(
        lambda x: applyCalcLevels(
            x["commodity_mill_priority_score"], 1, INDICATOR_LEVELS_MILL_PRIORITY
        ),
        axis=1,
    )

    return df


def addCommodityLevels(df):
    """
    Calculates and adds commodity threat and values levels.
    :param df: pandas dataframe
    :return: dataframe with calculated levels for each commodity + overall levels and scores
    """

    # add the calculated commodity levels for each of the indicators using yearly lookup values
    df = addLevelColumns(df, "total_area")

    # calculate and add the overall scores and overall levels
    df = addOverallScoresLevels(df)
    return df


def postProcessOTBN(otbn_value):
    """
    Parses the OTBN data results and removes any data prior to 2008 (start year of the OTBN monitoring)
    :param otbn_value: tree_cover_loss_arg_otbn_yearly input with yearly values as string or dict
    :return:

    """
    # load the string with the nested JSON results. Keys are category classification than years.
    if type(otbn_value) == str:
        d = json.loads(otbn_value)
    else:
        d = otbn_value

    filterD = {}

    # loop thought the categories
    for k, v in d.items():
        filterD[k] = {}  # add category as a key
        # check the keys (years stored as strings)
        for k2, v2 in v.items():
            if int(k2) >= 2008:  # logic to check if year should be included
                filterD[k][k2] = v2

    json_string = json.dumps(filterD)  # dump to JSON with double quotes
    return json_string
