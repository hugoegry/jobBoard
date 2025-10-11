import chalk from "chalk";

const styles = {
      log:   { color: chalk.blueBright,  icon: '[i]' },   // info
      info:  { color: chalk.blueBright,  icon: '[i]' },   // alias
      warn:  { color: chalk.yellowBright, icon: '[!]' },  // warning
      error: { color: chalk.redBright,   icon: '[x]' },   // error
      debug: { color: chalk.magentaBright, icon: '[*]' }, // debug
      table: { color: chalk.cyanBright,  icon: '[#]' }    // table
    };

/**
 * Parse une chaîne contenant {$color=colorName} ... {\endColor}
 * et remplace dynamiquement les balises par les couleurs Chalk.
 */
function parseColorString(str) { // Parser des couleurs dans les chaînes
    if (typeof str !== 'string') return str;
    const colorRegex = /\{\$color=(\w+)\}([\s\S]*?)\{\\endColor\}/g;
    return str.replace(colorRegex, (_, colorName, content) => {
        if (chalk[colorName]) {
            return chalk[colorName](content);
        }
        return content;
    });
}

// Crée global.log
const originalConsole = console;
global.log = {};

/**
 * Redéfinition de toutes les méthodes console (log, warn, error, etc.)
 * avec un préfixe coloré et un parseur de couleurs inline.
 *
 * @example
 * log.log("{$color=green}Serveur lancé avec succès{\\endColor}");
 * log.error("{$color=red}Erreur critique : base de données inaccessible{\\endColor}");
 *
 * @param {...any} args - Les arguments passés à la méthode (objets, chaînes, tableaux...).
 */
Object.keys(originalConsole).forEach(method => {
  global.log[method] = (...args) => {
    if (process.env.DEVMOD == false) return;
    const style = styles[method] || { color: chalk.white, icon: '[>]' };
    const parsedArgs = args.map(arg => typeof arg === 'string' ? parseColorString(arg) : arg); // Parse couleurs dans les chaînes
    const prefix = style.color.bold(`${style.icon} [Dev Logs]`);
    originalConsole[method](prefix, ...parsedArgs);
  };
});

/**
 * Liste complète des couleurs Chalk disponibles :
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────────────────
 * Base :
 * black, red, green, yellow, blue, magenta, cyan, white, gray, grey
 *
 * Versions "Bright" :
 * redBright, greenBright, yellowBright, blueBright, magentaBright, cyanBright, whiteBright
 *
 * Couleurs de fond (backgrounds) :
 * bgBlack, bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite
 * bgBlackBright, bgRedBright, bgGreenBright, bgYellowBright,
 * bgBlueBright, bgMagentaBright, bgCyanBright, bgWhiteBright
 *
 * Styles :
 * reset, bold, dim, italic, underline, inverse, hidden, strikethrough, visible
 * ────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Exemple :
 *   chalk.redBright.bold("Erreur critique !");
 *   chalk.bgBlue.white("Texte blanc sur fond bleu");
 *   log.log("{$color=cyanBright}Serveur démarré !{\\endColor}");
 *   log.warn("{$color=yellowBright}Attention au port 3000{\\endColor}");
 *   log.error("{$color=redBright}Erreur critique !{\\endColor}");
 */