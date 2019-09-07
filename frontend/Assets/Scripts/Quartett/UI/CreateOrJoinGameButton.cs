using System.Collections;
using System.Collections.Generic;
using TinyRoar.Framework;
using UnityEngine;
using UnityEngine.UI;

public class CreateOrJoinGameButton : BaseButton
{
    public bool IsCreateGame;
    public GameObject Loading;

    void Start()
    {
        Events.Instance.OnGameplayStatusChange += GameplayStatusChange;

    }

    void OnDestroy()
    {
        Events.Instance.OnGameplayStatusChange -= GameplayStatusChange;
    }

    void GameplayStatusChange(GameplayStatus oldMatchStatus, GameplayStatus newMatchStatus)
    {
        switch (newMatchStatus)
        {
            case GameplayStatus.GameRunning:
                Loading.SetActive(false);
                break;
        }
    }

    protected override void ButtonAction()
    {
        if (IsCreateGame)
        {
            GameHandler.Instance.DoRequest(GameHandler.RequestType.CreateGame);
        }
        else
        {
            GameHandler.Instance.DoRequest(GameHandler.RequestType.JoinGame);
        }
        Loading.SetActive(true);
    }
}
