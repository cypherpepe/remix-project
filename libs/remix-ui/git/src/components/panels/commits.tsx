import { checkout, ReadCommitResult } from "isomorphic-git";
import React from "react";
import { gitActionsContext } from "../../state/context";
import GitUIButton from "../buttons/gituibutton";
import { gitPluginContext } from "../gitui";
import LoaderIndicator from "../navigation/loaderindicator";
import { BranchDifferences } from "./branches/branchdifferences";
import { CommitDetails } from "./commits/commitdetails";
import { CommitSummary } from "./commits/commitsummary";

export const Commits = () => {
  const [hasNextPage, setHasNextPage] = React.useState(true)
  const context = React.useContext(gitPluginContext)
  const actions = React.useContext(gitActionsContext)

  const checkout = async (oid: string) => {
    try {
      actions.checkout({ ref: oid })
    } catch (e) {
      //
    }
  };

  const loadNextPage = () => {
    actions.fetch({
      remote: null,
      ref: context.currentBranch,
      relative: true,
      depth: 5,
      singleBranch: true
    })

  }

  const getRemote = () => {
    return context.upstream ? context.upstream : context.defaultRemote ? context.defaultRemote : null
  }

  const getCommitChanges = async (commit: ReadCommitResult) => {
    await actions.getCommitChanges(commit.oid, commit.commit.parent[0],null, getRemote())
  }

  const fetchIsDisabled = () => {
    return (!context.upstream)|| context.remotes.length === 0
  }

  return (
    <>
      {context.commits && context.commits.length ?
        <><BranchDifferences branch={context.currentBranch}></BranchDifferences><div>
          <div data-id={`commits-current-branch-${context.currentBranch && context.currentBranch.name}`} className="pt-1">
            {context.commits && context.commits.slice(0,5).map((commit, index) => {
              return (
                <CommitDetails branch={context.currentBranch} getCommitChanges={getCommitChanges} key={index} checkout={checkout} commit={commit}></CommitDetails>
              );
            })}
          </div>
        </div>
        {hasNextPage && <GitUIButton disabledCondition={fetchIsDisabled()} className="mb-1 ml-2 btn btn-sm" onClick={loadNextPage}>Load more</GitUIButton>}
        </>
        : <div className="text-muted">No commits</div>}
    </>
  )
}