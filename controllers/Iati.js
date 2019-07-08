//IATI Controller
var pg      = require('../models/pgpromise')
var express = require('express')
var router  = express.Router()
var config  = require('../config/app')

const welcomeMsg = (req, res, next) => {
    res.json ( {'http-status': 200, msg: 'ok', 'data': "Welcome from IATI"} )
}    

const getSdgs = (req, res, next) => {

    pg.pgDb.any('SELECT * FROM code.sdg ', [true])
    .then(function(data) {
        // success;
        res.json ( {'http-status': 200, msg: 'ok', 'data': data } )
    })
    .catch(function(error) {
        // error;
        res.json ( {'http-status': 503, msg: 'ok', 'data': error } )
    });

}

const getCounty = (req, res, next) => {

    pg.pgDb.any(`SELECT code, "name" AS "name", center FROM code.vw_county
        ORDER BY "name" `, [true])
    .then(function(data) {
        // success;
        res.json ( {'http-status': 200, msg: 'ok', 'data': data } )
    })
    .catch(function(error) {
        // error;
        res.json ( {'http-status': 503, msg: 'ok', 'data': error } )
    });

}

const getTransType = (req, res, next) => {

    pg.pgDb.any(`SELECT code, old_code, "name", description FROM code.tran_type 
      WHERE code NOT IN ('10','13','5','6','2','12','8','7','9') ORDER BY "name" `, [true])
    .then(function(data) {
        // success;
        res.json ( {'http-status': 200, msg: 'ok', 'data': data } )
    })
    .catch(function(error) {
        // error;
        res.json ( {'http-status': 503, msg: 'ok', 'data': error } )
    });
}

const getDateRange = (req, res, next) => {

    // {"selCounty":null,"selSdg":null,"selTrxnType":null,"selDateRange":{"from":null,"to":null}}

    var params = JSON.parse(req.query.params);

    var a = getSqlParams(params);
    
    var sql1 = `(SELECT EXTRACT(YEAR FROM trans_date) AS trans_date 
                 FROM web.full_trans WHERE trans_date IS NOT NULL 
                    AND (location_latitude NOT IN (-0.023559,-0.024) 
                    AND location_longitude NOT IN (37.906193,37.906 ))                  
                 ` 
                 + a.county + a.sdg + a.trxnType + ` ORDER BY trans_date ASC LIMIT 1)`;
    
    var sql2 = ` UNION ALL (SELECT EXTRACT(YEAR FROM trans_date) AS trans_date 
                 FROM web.full_trans WHERE trans_date IS NOT NULL 
                    AND (location_latitude NOT IN (-0.023559,-0.024) 
                    AND location_longitude NOT IN (37.906193,37.906 ))
                 `
                 + a.county + a.sdg + a.trxnType + ` ORDER BY trans_date DESC LIMIT 1)`;

    var sql = sql1 + sql2 ;
    
    pg.pgDb.any(sql, [true])
    .then(function(data) {
        // success;
        res.json ( {'http-status': 200, msg: 'ok', 'data': data } )
    })
    .catch(function(error) {
        // error;
        res.json ( {'http-status': 503, msg: 'ok', 'data': error } )
    });
}

const getDashboardData = (req, res, next) => {

    var params = JSON.parse(req.query.params);
    var a = getSqlParams(params);
    var b = getSqlParams(params, true); //Ignore trxn type
    var data = {}

    getTotalAmt(a.all , 'USD')
    .then( totalAmt => {
        data.totalAmt = totalAmt ;
        return getTotalAmtByYear(a.all, 'USD' );
    
    })
    .then( (totalAmtByYear) => {
       data.totalAmtByYear = totalAmtByYear ;
       //return getTotalAmtByYearMonth(a.all, 'USD');
       return getTotalAmtByTimeStamp(a.all, 'USD');
    
    })
    /*.then( (getTotalAmtByYearMonth) => {
       data.totalAmtByYearMonth = getTotalAmtByYearMonth ;
       return getTotalAmtByTimeStamp(a.all, 'USD');
    
    })*/
    .then( (getTotalAmtByTimeStamp) => {
       data.totalAmtByTimeStamp = getTotalAmtByTimeStamp ;
       return getTotalAmtByPublisher(a.all, 'USD');
    
    })
    .then( (getTotalAmtByPublisher) => {
       data.totalAmtByPublisher = getTotalAmtByPublisher ;
       return getTotalAmtBySdg(a.all, 'USD');
    
    })
    .then( (getTotalAmtBySdg) => {
       data.totalAmtBySdg = getTotalAmtBySdg ;
       return getTotalAmtByTrxnType(a.all, 'USD');
    
    })
    .then( (getTotalAmtByTrxnType) => {
       data.totalAmtByTrxnType = getTotalAmtByTrxnType ;
       return getSummaryByTrxnType(b.all, 'USD');
    
    })
    .then( (getSummaryByTrxnType) => {
       data.summaryByTrxnType = getSummaryByTrxnType ;
       return getTotalAmtByCounty(a.all, 'USD');
    
    })
    .then( (getTotalAmtByCounty) => {

       data.totalAmtByCounty = getTotalAmtByCounty ;
       res.json ( {'http-status': 200, msg: 'ok', 'data': data } );
    
    })
    .catch( err => {
    
      console.log(err);
      res.json ( {'http-status': 200, msg: 'ok', 'data': err } );
    
    });

}

const getTotalAmt = ( cond , currency ) => {
  return new Promise((resolve, reject) => {
    
    var sql = ` WITH dist_rec AS ( SELECT DISTINCT aid, trans_date, trans_usd, trans_id 
                FROM web.full_trans WHERE trans_date IS NOT NULL 
                 AND (location_latitude NOT IN (-0.023559,-0.024) 
                 AND location_longitude NOT IN (37.906193,37.906 )) 
                ` + cond + ` )
                SELECT ROUND(SUM(trans_usd)) AS total FROM dist_rec ;`
    
    pg.pgDb.any(sql, [true])
    .then(function(data) {
        resolve(data)

    })
    .catch(function(err) {
        reject(err)

    });
    
  });
};

const getTotalAmtByYear = ( cond , currency ) => {
  return new Promise((resolve, reject) => {
    
    var sql = ` WITH dist_rec AS ( SELECT DISTINCT aid, trans_date, trans_usd, trans_id 
                FROM web.full_trans WHERE trans_date IS NOT NULL 
                 AND (location_latitude NOT IN (-0.023559,-0.024) 
                 AND location_longitude NOT IN (37.906193,37.906 )) 
                ` + cond + ` )
                SELECT EXTRACT(YEAR FROM trans_date) AS trans_year, ROUND(SUM(trans_usd)) AS total
                FROM dist_rec GROUP BY trans_year ORDER BY total DESC ;`
    
    pg.pgDb.any(sql, [true])
    .then(function(data) {
        resolve(data)

    })
    .catch(function(err) {
        reject(err)

    });
    
  });
};

const getTotalAmtByYearMonth = ( cond , currency ) => {
  return new Promise((resolve, reject) => {
    
    var sql = ` WITH dist_rec AS ( SELECT DISTINCT aid, trans_date, trans_usd, trans_id 
                FROM web.full_trans WHERE trans_date IS NOT NULL 
                  AND (location_latitude NOT IN (-0.023559,-0.024) 
                  AND location_longitude NOT IN (37.906193,37.906 )) 
                ` + cond + ` )
                SELECT EXTRACT(YEAR FROM trans_date) AS trans_year, 
                       EXTRACT(MONTH FROM trans_date) as trans_month,  
                       ROUND(SUM(trans_usd)) AS total FROM dist_rec 
                GROUP BY trans_year, trans_month ORDER BY trans_year, trans_month ASC ;`
    
    pg.pgDb.any(sql, [true])
    .then(function(data) {
        resolve(data)

    })
    .catch(function(err) {
        reject(err)

    });
    
  });
};

const getTotalAmtByTimeStamp = ( cond , currency ) => {
  return new Promise((resolve, reject) => {
    
    var sql = ` WITH dist_rec AS ( SELECT DISTINCT aid, trans_day, trans_date, 
                trans_usd, trans_id 
                FROM web.full_trans WHERE trans_date IS NOT NULL ` + cond + ` )
                SELECT (trans_day*86400) as trans_ts, ROUND(SUM(trans_usd)) AS total 
                 FROM dist_rec GROUP BY trans_ts ORDER BY trans_ts ASC ;`
    
    pg.pgDb.any(sql, [true])
    .then(function(data) {
        resolve(data)

    })
    .catch(function(err) {
        reject(err)

    });
    
  });
};

const getTotalAmtByPublisher = ( cond , currency ) => {
  return new Promise((resolve, reject) => {
    
    var sql = ` WITH dist_rec AS ( SELECT DISTINCT publisher_id, publisher, 
                aid, trans_date, trans_usd, trans_id 
                FROM web.full_trans WHERE trans_date IS NOT NULL 
                AND (location_latitude NOT IN (-0.023559,-0.024) 
                    AND location_longitude NOT IN (37.906193,37.906 )) 
                ` + cond + ` )
                SELECT publisher_id, publisher,  ROUND(SUM(trans_usd)) AS total 
                FROM dist_rec GROUP BY publisher_id, publisher ORDER BY total DESC ;`
    
    pg.pgDb.any(sql, [true])
    .then(function(data) {
        resolve(data)

    })
    .catch(function(err) {
        reject(err)

    });
    
  });
};

const getTotalAmtBySdg = ( cond , currency ) => {
  return new Promise((resolve, reject) => {
    
    var sql = ` WITH dist_rec AS ( SELECT DISTINCT sdg_id, sdg_name, aid, 
                 trans_date, trans_usd, trans_id 
                FROM web.full_trans WHERE trans_date IS NOT NULL 
                AND (location_latitude NOT IN (-0.023559,-0.024) 
                    AND location_longitude NOT IN (37.906193,37.906 )) 
                ` + cond + ` )
                SELECT sdg_id, sdg_name,  ROUND(SUM(trans_usd)) AS total 
                FROM dist_rec GROUP BY sdg_id, sdg_name ORDER BY total DESC ;`
    
    pg.pgDb.any(sql, [true])
    .then(function(data) {
        resolve(data)

    })
    .catch(function(err) {
        reject(err)

    });
    
  });
};

const getTotalAmtByTrxnType = ( cond , currency ) => {
  return new Promise((resolve, reject) => {
    
    var sql = ` WITH dist_rec AS ( SELECT DISTINCT trans_code, 
                      aid, trans_date, trans_usd, trans_id
                FROM web.full_trans WHERE trans_date IS NOT NULL 
                AND (location_latitude NOT IN (-0.023559,-0.024) 
                    AND location_longitude NOT IN (37.906193,37.906 )) 
                ` + cond + ` )
                SELECT tt.code AS trxn_code, tt.name AS trxn_name,  
                 ROUND(SUM(trans_usd)) AS total 
                 FROM dist_rec JOIN code.tran_type tt 
                 ON (tt.code = trans_code OR tt.old_code = trans_code )
                  GROUP BY tt.code, tt.name ORDER BY total DESC ;`
    
    pg.pgDb.any(sql, [true])
    .then(function(data) {
        resolve(data)

    })
    .catch(function(err) {
        reject(err)

    });
    
  });
};

const getTotalAmtByCounty = ( cond , currency ) => {
  return new Promise((resolve, reject) => {
    
    var sql = ` WITH dist_rec AS ( SELECT DISTINCT county_code, county_name, 
                      aid, trans_date, trans_usd, trans_id 
                FROM web.full_trans WHERE trans_date IS NOT NULL 
                    AND (location_latitude NOT IN (-0.023559,-0.024) 
                    AND location_longitude NOT IN (37.906193,37.906 )) 
                ` + cond + ` )
                SELECT county_code, county_name AS county_name,  ROUND(SUM(trans_usd)) AS total 
                 FROM dist_rec GROUP BY county_code, county_name ORDER BY total DESC ;`
    
    pg.pgDb.any(sql, [true])
    .then(function(data) {
        resolve(data)

    })
    .catch(function(err) {
        reject(err)

    });
    
  });
};

const getSummaryByTrxnType = ( cond , currency ) => {
  return new Promise((resolve, reject) => {
    
    var sql = ` WITH dist_rec AS ( SELECT DISTINCT trans_code, 
                      aid, trans_date, trans_usd, trans_id 
                FROM web.full_trans WHERE trans_date IS NOT NULL 
                    AND (location_latitude NOT IN (-0.023559,-0.024) 
                    AND location_longitude NOT IN (37.906193,37.906 )) 
                    AND trans_code NOT IN ('10','13','5','6','2','12','8','7','9', 
                    'CG', 'IR', 'LR', 'QP', 'R', 'QS'
                    )
                ` + cond + ` )
                SELECT tt.code, tt.old_code, tt.name,  
                   ROUND(SUM(trans_usd)) AS total 
                 FROM dist_rec JOIN code.tran_type tt 
                 ON (tt.code = trans_code OR tt.old_code = trans_code ) 
                 GROUP BY tt.code, tt.old_code, tt.name ORDER BY total DESC;`
    
    pg.pgDb.any(sql, [true])
    .then(function(data) {
        resolve(data)

    })
    .catch(function(err) {
        reject(err)

    });
    
  });
};

function getSqlParams(params, ignoreTrxnType)
{
    var sql = {};
    
    var countySql   = params.selCounty != null && params.selCounty != '000' ? ' AND county_code IN (\''+ params.selCounty +'\')' : "";
    var sdgSql      = params.selSdg != null && params.selSdg != 0 ? ' AND sdg_id IN ('+ params.selSdg +')' : "";
    var trxnTypeSql = "";
    
    if (!ignoreTrxnType)
    {
      trxnTypeSql = params.selTrxnType == null ? "" : ' AND trans_code IN (\''+ params.selTrxnType.new +'\', \'' + params.selTrxnType. old + '\')';
    }
    
    var yearRange   = params.selDateRange.from != null && params.selDateRange.to != null ?
                      ' AND trans_date BETWEEN ' + '\'' +  params.selDateRange.from + '-01-01\'  AND ' + '\''+ params.selDateRange.to + '-12-31\''
                      : "";

    sql.county    = countySql ;
    sql.sdg       = sdgSql ;
    sql.trxnType  = trxnTypeSql ;
    sql.yearRange = yearRange ;
    sql.all       = countySql + sdgSql + trxnTypeSql + yearRange;

    //console.log(sql);
    return sql ;
  
}

const getCountyLocationTotalAmt = (req, res, next) => {

    var params = JSON.parse(req.query.params);
    var a = getSqlParams(params);

    sql = `WITH dist_rec AS ( SELECT DISTINCT county_code, county_name, location_name, location_latitude, location_longitude,
                      aid, trans_date, trans_usd, trans_id 
                FROM web.full_trans WHERE trans_date IS NOT NULL 
                    AND (location_latitude NOT IN (-0.023559,-0.024) 
                    AND location_longitude NOT IN (37.906193,37.906 )) 
								 `+ a.all +`		 
                )
                SELECT county_code, county_name AS county_name, COALESCE(location_name, 'Not specified') AS location_name,
                location_latitude, location_longitude, ROUND(SUM(trans_usd)) AS total 
                 FROM dist_rec GROUP BY county_code, county_name, location_name, 
                 location_latitude, location_longitude ORDER BY total DESC` ;

    pg.pgDb.any(sql, [true])
    .then(function(data) {
        // success;
        res.json ( {'http-status': 200, msg: 'ok', 'data': data } )
    })
    .catch(function(error) {
        // error;
        res.json ( {'http-status': 503, msg: 'ok', 'data': error } )
    });
}

const getSdgById = (req, res, next) => {
    var sdgId = req.params.id
    res.json ( {'http-status': 200, msg: 'ok', 'data': "Hello from CRUD User"} )
} 

const search = (req, res, next) => {
    var term = req.params.term;

    console.log(term);

    //const sql = pg.pgDb.format('SELECT DISTINCT location_name, county_code, county_name FROM web.full_trans WHERE location_name ILIKE $1 OR county_code ILIKE $1 OR  county_name ILIKE $1 ', [term]);
    //console.log('SQL:', sql);

    var termInt = parseInt(term);
    termInt     = isNaN(termInt) ? -1 : termInt ;
    
    pg.pgDb.multi(`SELECT DISTINCT location_name, county_code, county_name FROM web.full_trans WHERE location_name ILIKE '%` + term + `%' OR county_code ILIKE '%` + term + `%' OR  county_name ILIKE '%` + term + `%'; SELECT DISTINCT sdg_id, sdg_name FROM web.full_trans WHERE sdg_id= `+ termInt +` OR sdg_name ILIKE '%` + term + `%'; SELECT code, old_code, name, description FROM code.tran_type WHERE (code LIKE '%`+ term +`%' OR "name" ILIKE '%` + term +`%' OR "description" ILIKE '%` + term +`%') AND code IN ('1','11','3','4') ` )
     .then(data => {

        var county = data[0];
        var sdg    = data[1];
        var trxn   = data[2];

        res.json ( {'http-status': 200, msg: 'ok', 'data': { county:county, sdg:sdg, trxn:trxn } } ) ;
        
    })
    .catch(error => {
        console.log('ERROR:', error); // print the error;
        res.json ( {'http-status': 200, msg: 'ok', 'data': error } )
    });
            
} 

module.exports = {   
    welcomeMsg,
    getSdgs,
    getSdgById,
    getCounty,
    getTransType,
    getDateRange,
    getDashboardData,
    getCountyLocationTotalAmt,
    search,
}
