import { danger, message, schedule } from 'danger';

import todos from 'danger-plugin-todos';
import {
  createOrAddLabelsFromPRTitle,
  doesDescriptionExists,
  doesPRtargetMain,
  enforceLinearHistory,
  isDescriptionCorrectlyFormatted,
  isPRTooBig,
  isWIP,
  labels,
  auditCI,
} from './.danger';

const docs = danger.git.fileMatch('**/*.md');

if (docs.edited) {
  message(
    'Thanks - We :heart: our [documentarians](http://www.writethedocs.org/)!'
  );
}

enforceLinearHistory();

if (danger.github?.pr) {
  auditCI();
  
  isPRTooBig(600);

  doesDescriptionExists();
  isDescriptionCorrectlyFormatted();

  doesPRtargetMain();

  // extracting labels from inside brackets
  createOrAddLabelsFromPRTitle(/(?<=\[)(.*?)(?=\])/g);

  if (isWIP()) {
    const title = ':construction: Work In Progress label found';
    const idea =
      'Try using draft pull requests instead. ' +
      'Read more @ [GitHub docs](https://docs.github.com/pt/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests#draft-pull-requests)';
    message(`${title} - <i>${idea}</i>`);
  }

  schedule(
    labels({
      rules: [
        { match: /WIP/i, label: 'Work In Progress' },
        { match: /Ready for Review/i, label: 'Ready for Review' },
      ],
    })
  );

  schedule(
    todos({
      repoUrl: 'https://github.com/AliProximo/aliproximo',
    })
  );
}